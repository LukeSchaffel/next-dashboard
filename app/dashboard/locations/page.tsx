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
} from "@mantine/core";
import { Location } from "@prisma/client";

import { Table } from "@/lib/components";
import LocationForm from "./_components/LocationForm";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../_components/client-layout";
import Link from "next/link";
import { IconEye } from "@tabler/icons-react";

export default function LocationsPage() {
  const { userRole } = useContext(DashboardContext);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<
    Location | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocations = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/locations?workspaceId=${userRole.workspaceId}`
      );
      const locationsJSON = await res.json();
      setLocations(locationsJSON);
      setLoading(false);
    };
    getLocations();
  }, []);

  const handleAddLocation = (location: Location) => {
    setLocations([...locations, location]);
  };

  const handleUpdateLocation = (location: Location) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === location.id ? location : loc))
    );
  };

  const handleDeleteLocation = async (location: Location) => {
    try {
      const res = await fetch(`/api/locations/${location.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLocations((prev) => [...prev].filter((l) => l.id !== location.id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Flex justify={"space-between"}>
        <Title order={4}>Locations</Title>
        <LocationForm
          userRole={userRole}
          handleAddLocation={handleAddLocation}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          handleUpdateLocation={handleUpdateLocation}
        />
      </Flex>

      <Table
        loading={loading}
        data={{
          caption: "My locations",
          head: ["", "Name", "Address", ""],
          body: locations.map((loc) => {
            return [
              <Link href={`/dashboard/locations/${loc.id}`} key={loc.id}>
                <Button variant="subtle" leftSection={<IconEye size={16} />}>
                  View
                </Button>
              </Link>,
              loc.name,
              loc.address || "No address provided",
              <Flex>
                <Button
                  variant="subtle"
                  onClick={() => setSelectedLocation(loc)}
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
                      onClick={() => handleDeleteLocation(loc)}
                      color="red"
                    >
                      Yes
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              </Flex>,
            ];
          }),
        }}
      />
    </>
  );
}
