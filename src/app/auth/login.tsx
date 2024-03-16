import React from "react";
import Box from "@ui/Box";
import Container from "@ui/Container";
import Text from "@ui/Text";
import { ScrollView } from "react-native";
import { cn } from "@/lib/utils";
import Input from "@ui/Input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@ui/Button";
import { useMutation } from "react-query";
import api from "@/lib/api";
import Alert from "@ui/Alert";
import { setAuthToken } from "@/stores/authStore";
import { router } from "expo-router";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type FormSchema = z.infer<typeof schema>;

const defaultValues: FormSchema = {
  username: "",
  password: "",
};

const LoginPage = () => {
  const form = useForm({ resolver: zodResolver(schema), defaultValues });
  const login = useMutation({
    mutationFn: (json: FormSchema) =>
      api.auth.login.$post({ json }).then((res) => res.json()),
    onSuccess: async (data) => {
      setAuthToken(data.token);
      router.navigate("/");
    },
  });

  return (
    <ScrollView
      contentContainerStyle={cn("flex-1 flex items-center justify-center")}
    >
      <Container className="p-4">
        <Box className="p-8 bg-white rounded-lg">
          <Text className="text-2xl">Login</Text>

          <Input
            label="Username"
            form={form}
            path="username"
            className="mt-6"
          />
          <Input
            label="Password"
            form={form}
            path="password"
            className="mt-4"
            secureTextEntry
          />

          <Alert className="mt-4" error={login.error} />

          <Button
            className="mt-8"
            onPress={form.handleSubmit((val) => login.mutate(val))}
          >
            Login
          </Button>
        </Box>
      </Container>
    </ScrollView>
  );
};

export default LoginPage;
