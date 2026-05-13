import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import crypto from 'crypto';

import Company from '../models/Company.model.js';
import Ticket from '../models/Ticket.model.js';
import User from '../models/User.model.js';
import { decrypt } from '../utils/encryption.js';

function getEmailDomain(address = '') {
  const at = address.lastIndexOf('@');
  return at === -1 ? '' : address.slice(at + 1).toLowerCase();
}

function asText(input) {
  if (!input) return '';
  if (typeof input === 'string') return input;
  return String(input);
}

function getProviderDefaults(provider) {
  if (provider === 'gmail') {
    return { imapHost: 'imap.gmail.com', imapPort: 993, imapSecure: true, smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpSecure: false };
  }
  if (provider === 'outlook') {
    // Outlook.com / Microsoft 365 generally use these
    return { imapHost: 'outlook.office365.com', imapPort: 993, imapSecure: true, smtpHost: 'smtp.office365.com', smtpPort: 587, smtpSecure: false };
  }
  return {};
}

async function ensureCustomer({ email, name, companyId }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const password = crypto.randomBytes(12).toString('hex');
  return await User.create({
    name: name || email,
    email,
    password,
    role: 'customer',
    company: companyId,
    isActive: true
  });
}

async function resolveCompanyForSender({ mainCompanyId, senderEmail }) {
  const domain = getEmailDomain(senderEmail);
  if (!domain) return null;

  // Prefer a matching client-company under this main company
  const clientCompany = await Company.findOne({
    type: 'client-company',
    parentCompany: mainCompanyId,
    domain: domain
  });
  if (clientCompany) return clientCompany;

  // Fallback: match by suffix (e.g., user@client.subdomain.com matching stored domain)
  const bySuffix = await Company.findOne({
    type: 'client-company',
    parentCompany: mainCompanyId,
    domain: { $exists: true, $ne: '' }
  }).lean();
  if (bySuffix?.domain && domain.endsWith(bySuffix.domain.toLowerCase())) {
    return await Company.findById(bySuffix._id);
  }

  return null;
}

export async function syncInboundEmailForCompany(company) {
  if (!company?.emailConfig?.enabled || !company.emailConfig.inboundEnabled) return { synced: 0 };

  const provider = company.emailConfig.provider || 'custom';
  const defaults = getProviderDefaults(provider);

  const imapHost = company.emailConfig.imapHost || defaults.imapHost;
  const imapPort = company.emailConfig.imapPort || defaults.imapPort || 993;
  const imapSecure = typeof company.emailConfig.imapSecure === 'boolean' ? company.emailConfig.imapSecure : (defaults.imapSecure ?? true);
  const imapUser = company.emailConfig.imapUser || company.emailConfig.user;
  const imapPass = company.emailConfig.imapPass ? decrypt(company.emailConfig.imapPass) : (company.emailConfig.pass ? decrypt(company.emailConfig.pass) : undefined);
  const mailbox = company.emailConfig.inboxFolder || 'INBOX';

  if (!imapHost || !imapUser || !imapPass) {
    throw new Error(`IMAP is not configured for company ${company._id} (${company.name})`);
  }

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: imapSecure,
    auth: {
      user: imapUser,
      pass: imapPass
    }
  });

  let synced = 0;
  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);
    try {
      const lastUid = company.emailConfig.lastUid || 0;
      const range = `${Math.max(1, lastUid + 1)}:*`;

      // Fetch new messages by UID
      for await (const msg of client.fetch(range, { uid: true, envelope: true, source: true, internalDate: true })) {
        const uid = msg.uid;
        const parsed = await simpleParser(msg.source);
        const messageId = asText(parsed.messageId || msg.envelope?.messageId || '').trim();
        const fromAddr = parsed.from?.value?.[0]?.address || msg.envelope?.from?.[0]?.address || '';

        // Dedupe: if we don't have a messageId, we still advance UID and skip
        if (messageId) {
          const exists = await Ticket.exists({ 'email.messageId': messageId });
          if (!exists) {
            const clientCompany = await resolveCompanyForSender({ mainCompanyId: company._id, senderEmail: fromAddr });
            const ticketCompany = clientCompany || company;

            const creator = await ensureCustomer({
              email: fromAddr || `unknown-${uid}@inbound.local`,
              name: parsed.from?.value?.[0]?.name,
              companyId: ticketCompany._id
            });

            const subject = asText(parsed.subject || '(No subject)').slice(0, 250);
            const body = asText(parsed.text || parsed.html || '').trim() || '(No message content)';

            await Ticket.create({
              subject,
              description: body,
              status: 'open',
              priority: 'medium',
              createdBy: creator._id,
              company: ticketCompany.name,
              companyId: ticketCompany._id,
              email: {
                messageId,
                from: fromAddr,
                to: (parsed.to?.value || []).map(v => v.address).filter(Boolean),
                cc: (parsed.cc?.value || []).map(v => v.address).filter(Boolean),
                receivedAt: msg.internalDate || parsed.date || new Date(),
                subject
              }
            });
            synced += 1;
          }
        }

        // Advance checkpoint no matter what (prevents re-reading the same email forever)
        company.emailConfig.lastUid = Math.max(company.emailConfig.lastUid || 0, uid);
      }

      company.emailConfig.lastInboundSyncAt = new Date();
      await company.save();
    } finally {
      lock.release();
    }
  } finally {
    try {
      await client.logout();
    } catch {
      // ignore
    }
  }

  return { synced };
}

export async function syncInboundEmailForAllCompanies() {
  const companies = await Company.find({
    type: 'main-company',
    'emailConfig.enabled': true,
    'emailConfig.inboundEnabled': true
  });

  let total = 0;
  for (const company of companies) {
    try {
      const res = await syncInboundEmailForCompany(company);
      total += res.synced;
    } catch (e) {
      console.error(`Inbound sync failed for ${company.name}:`, e.message);
    }
  }
  return { total };
}

export async function testImapConnectionForCompany(company) {
  const provider = company?.emailConfig?.provider || 'custom';
  const defaults = getProviderDefaults(provider);

  const imapHost = company.emailConfig.imapHost || defaults.imapHost;
  const imapPort = company.emailConfig.imapPort || defaults.imapPort || 993;
  const imapSecure = typeof company.emailConfig.imapSecure === 'boolean' ? company.emailConfig.imapSecure : (defaults.imapSecure ?? true);
  const imapUser = company.emailConfig.imapUser || company.emailConfig.user;
  const imapPass = company.emailConfig.imapPass ? decrypt(company.emailConfig.imapPass) : (company.emailConfig.pass ? decrypt(company.emailConfig.pass) : undefined);
  const mailbox = company.emailConfig.inboxFolder || 'INBOX';

  if (!imapHost || !imapUser || !imapPass) {
    throw new Error('IMAP settings are incomplete');
  }

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: imapSecure,
    auth: { user: imapUser, pass: imapPass }
  });

  try {
    await client.connect();
    await client.mailboxOpen(mailbox);
    return { success: true, message: `IMAP connected and opened ${mailbox}` };
  } finally {
    try {
      await client.logout();
    } catch {
      // ignore
    }
  }
}
