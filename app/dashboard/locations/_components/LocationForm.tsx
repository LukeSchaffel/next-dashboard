"use client";
import { IconPlus } from "@tabler/icons-react";
import { TextInput, Modal, Button, Flex, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

import { Location } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { useLocationStore } from "@/stores/useLocationStore";

const LocationForm = ({
  userRole,
  selectedLocation,
  setSelectedLocation,
}: {
  userRole: any;
  selectedLocation?: Location;
  setSelectedLocation: React.Dispatch<SetStateAction<Location | undefined>>;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const { createLocation, updateLocation } = useLocationStore();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      address: "",
    },

    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
    },
  });

  const handleCancel = () => {
    form.reset();
    setLoading(false);
    setSelectedLocation(undefined);
    close();
  };

  useEffect(() => {
    if (selectedLocation) {
      open();
      const { name, address } = selectedLocation;
      form.setValues((prev) => ({
        ...prev,
        name,
        address: address || "",
      }));
    }
  }, [selectedLocation]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation.id, {
          ...values,
          workspaceId: userRole.workspaceId,
        });
      } else {
        await createLocation({
          ...values,
          workspaceId: userRole.workspaceId,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleCancel();
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={selectedLocation ? "Edit location" : "Create a new location"}
        centered
        closeButtonProps={{ onClick: handleCancel }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Flex gap={"md"} direction={"column"}>
            <TextInput
              label="Location name"
              placeholder="My location"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Address"
              placeholder="123 Main St, City, State"
              {...form.getInputProps("address")}
            />
            <Button type="submit">Submit</Button>
          </Flex>
        </form>
      </Modal>

      <Button variant="filled" onClick={open} leftSection={<IconPlus />}>
        New location
      </Button>
    </>
  );
};

export default LocationForm;
