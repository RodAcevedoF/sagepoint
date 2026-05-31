"use client";

import { BookOpen, Users, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, Pill, toneColor, type AuroraTone } from "@/shared/components";
import { categoryTone } from "@/features/blog/constants/categoryAssets";
import type { CategoryRoomDto } from "@/infrastructure/api/categoryRoomApi";

interface RoomCardProps {
  room: CategoryRoomDto;
}

export function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();
  const tone: AuroraTone = categoryTone(room.slug);

  return (
    <Card
      variant="aurora"
      accent={toneColor(tone)}
      onClick={() => router.push(`/explore/rooms/${room.slug}`)}
    >
      <Card.Zone>
        <Card.ZoneCat icon={<LayoutGrid size={13} />}>Room</Card.ZoneCat>
      </Card.Zone>

      <Card.Body>
        <Card.Head>
          <Card.HeadText>
            <Card.Title>{room.name}</Card.Title>
          </Card.HeadText>
        </Card.Head>
        {room.description && <Card.Desc>{room.description}</Card.Desc>}
      </Card.Body>

      <Card.Foot>
        <Card.FootLeft>
          <Pill tone={tone} icon={<BookOpen size={13} />}>
            {room.roadmapCount} roadmap{room.roadmapCount !== 1 ? "s" : ""}
          </Pill>
          <Pill tone="concept" icon={<Users size={13} />}>
            {room.memberCount} member{room.memberCount !== 1 ? "s" : ""}
          </Pill>
        </Card.FootLeft>
      </Card.Foot>
    </Card>
  );
}
