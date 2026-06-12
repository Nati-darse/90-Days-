import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { supabase } from "./supabaseClient.js";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.get("/profile-test", async (req, res) => {
  try {
    // Login
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "12345678",
      });

    if (authError) {
      return res.json({ authError });
    }

    const accessToken = authData.session.access_token;

    // Authenticated Supabase client
  const authenticatedSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

await authenticatedSupabase.auth.setSession({
  access_token: accessToken,
  refresh_token: authData.session.refresh_token,
});

    // Query with RLS
  const { data, error } = await authenticatedSupabase
  .from("profiles")
  .select("*");

    return res.json({
      loggedInUser: authData.user.id,
      profileData: data,
      error,
    });

  } catch (err) {
    return res.json({ error: err.message });
  }
});

app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json({
    message: "User created successfully",
    user: data.user,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return res.status(401).json({
      error: error.message,
    });
  }

  return res.json({
    message: "Login successful",
    session: data.session,
    user: data.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});