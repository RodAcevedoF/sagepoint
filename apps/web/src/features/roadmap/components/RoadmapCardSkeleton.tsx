import { AuroraSkeleton, Card } from "@/shared/components";

export function RoadmapCardSkeleton() {
  return (
    <Card variant="aurora">
      <Card.Zone>
        <AuroraSkeleton height={22} width={110} radius={999} />
        <AuroraSkeleton height={22} width={80} radius={999} />
      </Card.Zone>

      <Card.Body>
        <Card.Head>
          <Card.HeadText
            style={{ display: "flex", flexDirection: "column", gap: 9 }}
          >
            <AuroraSkeleton height={18} width="70%" />
            <AuroraSkeleton height={12} width="40%" />
          </Card.HeadText>
          <AuroraSkeleton height={50} width={50} radius="50%" />
        </Card.Head>
        <AuroraSkeleton height={12} width="90%" />
        <AuroraSkeleton height={12} width="65%" />
        <Card.DataRow>
          <AuroraSkeleton height={56} style={{ flex: 1 }} />
          <AuroraSkeleton height={56} style={{ flex: 1 }} />
        </Card.DataRow>
      </Card.Body>

      <Card.Foot>
        <AuroraSkeleton height={14} width={120} />
        <AuroraSkeleton height={24} width={80} />
      </Card.Foot>
    </Card>
  );
}
