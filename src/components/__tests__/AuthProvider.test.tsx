import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthProvider";

vi.mock("../../lib/auth", () => {
  const mockUser = {
    access_token: "mock-token-123",
    expired: false,
    profile: { sub: "user-1", preferred_username: "electron", email: "e@test.com" },
  };
  return {
    userManager: {
      getUser: vi.fn().mockResolvedValue(mockUser),
      signinRedirectCallback: vi.fn().mockResolvedValue(mockUser),
      events: {
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        removeUserLoaded: vi.fn(),
        removeUserUnloaded: vi.fn(),
      },
    },
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue("mock-token-123"),
  };
});

function TestConsumer() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>loading</div>;
  if (!isAuthenticated) return <div>unauthenticated</div>;
  return <div>hello {user?.profile.preferred_username}</div>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading then authenticated user", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText("hello electron")).toBeDefined();
    });
  });

  it("shows unauthenticated when no user", async () => {
    const { userManager } = await import("../../lib/auth");
    vi.mocked(userManager.getUser).mockResolvedValueOnce(null);
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeDefined();
    });
  });
});
