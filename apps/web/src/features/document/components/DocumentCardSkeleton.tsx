import { AuroraSkeleton, Card, toneColor } from "@/shared/components";

export function DocumentCardSkeleton() {
  return (
    <Card variant="aurora" accent={toneColor("proc")}>
      <Card.Zone>
        <AuroraSkeleton height={22} width={70} radius={999} />
        <AuroraSkeleton height={22} width={88} radius={999} />
      </Card.Zone>

      <Card.Body>
        <Card.Head>
          <AuroraSkeleton height={44} width={44} radius={13} />
          <Card.HeadText
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 9,
              paddingTop: 4,
            }}
          >
            <AuroraSkeleton height={18} width="82%" />
            <AuroraSkeleton height={11} width="44%" />
          </Card.HeadText>
        </Card.Head>
        <AuroraSkeleton height={11} width="92%" />
        <AuroraSkeleton height={11} width="70%" />
      </Card.Body>

      <Card.Foot>
        <AuroraSkeleton height={12} width={80} />
        <AuroraSkeleton height={20} width={60} />
      </Card.Foot>
    </Card>
  );
}
