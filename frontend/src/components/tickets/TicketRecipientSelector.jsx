import React, { useState } from "react";
import { Check, ChevronsUpDown, X, User, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function TicketRecipientSelector({
    selectedEmails = [],
    onChange,
    contacts = [],
    suggestedContacts = [],
    placeholder = "Select recipients...",
}) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const handleSelect = (email) => {
        if (selectedEmails.includes(email)) {
            onChange(selectedEmails.filter((e) => e !== email));
        } else {
            onChange([...selectedEmails, email]);
        }
        setOpen(false);
        setInputValue("");
    };

    const handleRemove = (email) => {
        onChange(selectedEmails.filter((e) => e !== email));
    };

    // Helper to find contact name by email
    const getContactName = (email) => {
        const contact = contacts.find((c) => c.email === email);
        return contact ? contact.name : email; // Fallback to email if not found
    };

    // Helper to find contact object
    const getContact = (email) => contacts.find(c => c.email === email);

    // Filter out contacts that are already selected for the dropdown list
    // But we want to allow toggling, so maybe keep them? The CommandItem usually handles selection state.
    // Standard multiselect often hides selected items from list or shows checkmark. I'll show checkmark.

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {selectedEmails.map((email) => {
                    const contact = getContact(email);
                    return (
                        <Badge key={email} variant="secondary" className="gap-1 pr-1 flex items-center">
                            <span className="flex items-center gap-1.5">
                                {contact ? <User className="h-3 w-3 opacity-50" /> : <Mail className="h-3 w-3 opacity-50" />}
                                {contact ? contact.name : email}
                            </span>
                            <button
                                type="button"
                                className="ml-1 rounded-full hover:bg-muted p-0.5 focus:outline-none"
                                onClick={() => handleRemove(email)}
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {email}</span>
                            </button>
                        </Badge>
                    );
                })}

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="h-7 text-xs px-2"
                            size="sm"
                        >
                            <span className="text-muted-foreground mr-1">+</span> {placeholder}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search contacts..."
                                value={inputValue}
                                onValueChange={setInputValue}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {inputValue && inputValue.includes('@') ? (
                                        <div className="p-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => handleSelect(inputValue)}
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                Add "{inputValue}"
                                            </Button>
                                        </div>
                                    ) : (
                                        "No contact found."
                                    )}
                                </CommandEmpty>

                                {/* Suggested Contacts Group */}
                                {suggestedContacts.length > 0 && (
                                    <CommandGroup heading="Suggested">
                                        {suggestedContacts.map((contact) => (
                                            <CommandItem
                                                key={contact._id || contact.id}
                                                value={`${contact.name} ${contact.email}`}
                                                onSelect={() => handleSelect(contact.email)}
                                            >
                                                <div className="flex items-center gap-2 flex-1 w-full overflow-hidden">
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4 flex-shrink-0",
                                                            selectedEmails.includes(contact.email) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col truncate">
                                                        <span className="font-medium truncate">{contact.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate">{contact.email}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}

                                <CommandSeparator />

                                {/* All Contacts Group */}
                                <CommandGroup heading="All Contacts">
                                    {contacts
                                        .filter(c => !suggestedContacts.some(sc => sc.email === c.email)) // Exclude suggested
                                        .map((contact) => (
                                            <CommandItem
                                                key={contact._id || contact.id}
                                                value={`${contact.name} ${contact.email}`}
                                                onSelect={() => handleSelect(contact.email)}
                                            >
                                                <div className="flex items-center gap-2 flex-1 w-full overflow-hidden">
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4 flex-shrink-0",
                                                            selectedEmails.includes(contact.email) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col truncate">
                                                        <span className="font-medium truncate">{contact.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate">{contact.email}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
