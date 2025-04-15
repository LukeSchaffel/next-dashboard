"use client";
import { IconPlus } from "@tabler/icons-react";
import { TextInput, Modal, Button, Flex, LoadingOverlay, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";

import { Location } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { useLocationStore } from "@/stores/useLocationStore";
import DescriptionEditor from "./DescriptionEditor";

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
  const [descriptionEditorOpened, setDescriptionEditorOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createLocation, updateLocation } = useLocationStore();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      address: "",
      description: "",
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
      const { name, address, description } = selectedLocation;
      form.setValues((prev) => ({
        ...prev,
        name,
        address: address || "",
        description: description || "",
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

  const handleDescriptionUpdate = (updatedLocation: Location) => {
    if (selectedLocation) {
      setSelectedLocation(updatedLocation);
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
            <Group justify="space-between" align="flex-end">
              <TextInput
                label="Description"
                placeholder="Describe this location"
                {...form.getInputProps("description")}
                readOnly
                style={{ flex: 1 }}
              />
              {selectedLocation && (
                <Button
                  variant="subtle"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setDescriptionEditorOpened(true)}
                >
                  Edit
                </Button>
              )}
            </Group>
            <Button type="submit">Submit</Button>
          </Flex>
        </form>
      </Modal>

      <Button variant="filled" onClick={open} leftSection={<IconPlus />}>
        New location
      </Button>

      {selectedLocation && (
        <DescriptionEditor
          opened={descriptionEditorOpened}
          onClose={() => setDescriptionEditorOpened(false)}
          description={selectedLocation.description || ""}
          locationId={selectedLocation.id}
          onUpdate={handleDescriptionUpdate}
        />
      )}
    </>
  );
};

export default LocationForm;
