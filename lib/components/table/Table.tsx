import {
  ScrollArea,
  Table as MantineTable,
  TableData,
  LoadingOverlay,
  Box,
} from "@mantine/core";

interface ITableProps {
  data: TableData;
  loading?: boolean;
}

export const Table = ({ data, loading = false }: ITableProps) => {
  return (
    <Box style={{ position: "relative" }}>
      <ScrollArea scrollbars={"x"}>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <MantineTable
          withTableBorder
          highlightOnHover
          striped
          mt={"md"}
          data={data}
        />
      </ScrollArea>
    </Box>
  );
};
