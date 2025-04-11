"use client";
import {
  Flex,
  Title,
  Button,
  Box,
  Popover,
  Text,
  ScrollArea,
  Anchor,
  Group,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { Location } from "@prisma/client";

import { Table } from "@/lib/components";
import LocationForm from "./_components/LocationForm";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../_components/client-layout";
import Link from "next/link";
import { IconEye, IconRefresh } from "@tabler/icons-react";
import { useLocationStore } from "@/stores/useLocationStore";

export default function LocationsPage() {
  const { userRole } = useContext(DashboardContext);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const { locations, loading, hasFetched, fetchLocations, deleteLocation } = useLocationStore();

  useEffect(() => {
    if (!hasFetched) {
      fetchLocations();
    }
  }, [hasFetched, fetchLocations]);

  return (
    <>
      <Flex justify={"space-between"}>
        <Group>
          <Title order={4}>Locations</Title>
          <Button 
            variant="subtle" 
            leftSection={<IconRefresh size={16} />} 
            onClick={fetchLocations}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>
        <LocationForm
          userRole={userRole}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
      </Flex>

      <Table
        loading={loading}
        data={{
          caption: "My locations",
          head: ["", "Name", "Address", ""],
          body: locations.map((location) => {
            return [
              <Link href={`/dashboard/locations/${location.id}`} key={`view-${location.id}`}>
                <Button variant="subtle" leftSection={<IconEye size={16} />}>
                  View
                </Button>
              </Link>,
              location.name,
              location.address || "No address",
              <Flex key={`actions-${location.id}`}>
                <Button
                  variant="subtle"
                  onClick={() => setSelectedLocation(location)}
                >
                  Edit
                </Button>

                <Popover shadow="md">
                  <Popover.Target>
                    <Button color="red" variant="transparent">
                      Delete
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Text size="xs">Are you sure you want to delete this?</Text>
                    <Button
                      variant="transparent"
                      size="xs"
                      onClick={() => deleteLocation(location.id)}
                      color="red"
                    >
                      Yes
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              </Flex>
            ];
          }),
        }}
      />
    </>
  );
}
