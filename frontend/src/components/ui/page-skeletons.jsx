import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const MetricSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-28" />
    </CardContent>
  </Card>
);

export const ReportsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <MetricSkeleton key={index} />
      ))}
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-2xl" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export const ContactsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>

    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <Card key={index} className="border">
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  </div>
);

export const CompaniesSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((index) => (
          <MetricSkeleton key={index} />
        ))}
      </div>
    </div>

    <Card>
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Card key={index}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const TicketsSkeleton = () => (
  <div className="flex h-full -m-4 md:-m-6">
    <div className="hidden md:block w-56 border-r bg-card p-4 space-y-3">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>

    <div className="flex-1 flex flex-col min-w-0 bg-background space-y-4 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-3">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <MetricSkeleton key={index} />
      ))}
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export const AdminUsersSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>

    <div className="flex gap-4">
      <Skeleton className="h-10 flex-1 max-w-md" />
      <Skeleton className="h-10 w-48 rounded-md" />
    </div>

    <Card>
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-60" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const AgentManagementSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <MetricSkeleton key={index} />
      ))}
    </div>

    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export const TicketDetailSkeleton = () => (
  <div className="flex h-full -m-4 md:-m-6">
    <div className="hidden xl:flex w-80 border-r bg-card p-4">
      <div className="w-full space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>

    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 border-b pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4 md:p-6">
            <Skeleton className="h-6 w-40" />
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-2 rounded-xl border p-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export const CompanySettingsSkeleton = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-300">
    <div className="flex items-center gap-4">
      <Skeleton className="h-9 w-36 rounded-md" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>
    <Card>
      <CardContent className="space-y-6 pt-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-44 rounded-md" />
        </div>
      </CardContent>
    </Card>
  </div>
);
