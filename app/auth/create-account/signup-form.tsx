import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useForm } from "@mantine/form";

const SignupForm = () => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
      password2: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value, values) =>
        value !== values.password2 ? "Passwords did not match" : null,
    },
  });

  const handleSubmit = (values: any) => {
    console.log(values);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome!</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Link href={"/auth"} passHref={true}>
          <Anchor size="sm" component="button">
            Login now
          </Anchor>
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps("password")}
          />
          <PasswordInput
            label="Re-enter password"
            placeholder="Verify your password"
            required
            mt="md"
            {...form.getInputProps("password2")}
          />
          <Group justify="space-between" mt="lg"></Group>
          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default SignupForm;
