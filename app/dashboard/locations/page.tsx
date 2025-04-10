"use client";
import { useEffect, useState } from "react";
import { Flex, Title, Button, Popover, Text } from "@mantine/core";
import { Location } from "@prisma/client";
import { Table } from "@/lib/components";
import LocationForm from "./_components/LocationForm";
import { useDashboard } from "../_components/client-layout";

const LocationsPage = () => {
  const { userRole } = useDashboard();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location>();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = (location: Location) => {
    setLocations((prev) => [...prev, location]);
  };

  const handleUpdateLocation = (updatedLocation: Location) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === updatedLocation.id ? updatedLocation : loc
      )
    );
  };

  const handleDeleteLocation = async (location: Location) => {
    try {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLocations((prev) => prev.filter((loc) => loc.id !== location.id));
      } else {
        console.error("Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location", error);
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
          head: ["Name", "Address", ""],
          body: locations.map((loc) => {
            return [
              loc.name,
              loc.address || "No address provided",
              <Flex>
                <Button variant="subtle" onClick={() => setSelectedLocation(loc)}>
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
};

export default LocationsPage;
