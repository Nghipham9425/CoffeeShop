import { useEffect, useRef } from "react";
import { FaGoogle } from "react-icons/fa";
import { Button } from "../ui/button";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }): void;
      renderButton(
        parent: HTMLElement,
        options: {
          type: "standard";
          theme: "outline";
          size: "large";
          text: "continue_with";
          shape: "rectangular";
          logo_alignment: "left";
          width: number;
        },
      ): void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityServices() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("#google-identity-services");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Không tải được dịch vụ đăng nhập Google.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không tải được dịch vụ đăng nhập Google."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

type GoogleSignInButtonProps = {
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
};

export function GoogleSignInButton({ disabled = false, onCredential, onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const credentialCallbackRef = useRef(onCredential);
  const errorCallbackRef = useRef(onError);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  credentialCallbackRef.current = onCredential;
  errorCallbackRef.current = onError;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    loadGoogleIdentityServices()
      .then(() => {
        const container = containerRef.current;
        const google = window.google;
        if (cancelled || !container || !google) return;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              credentialCallbackRef.current(response.credential);
              return;
            }

            errorCallbackRef.current("Google không trả về thông tin xác thực. Vui lòng thử lại.");
          },
        });

        container.replaceChildren();
        google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.max(180, Math.floor(container.clientWidth)),
        });
      })
      .catch((error) => {
        if (!cancelled) {
          errorCallbackRef.current(error instanceof Error ? error.message : "Không thể mở đăng nhập Google.");
        }
      });

    return () => {
      cancelled = true;
      containerRef.current?.replaceChildren();
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => onError("Chưa cấu hình VITE_GOOGLE_CLIENT_ID cho giao diện.")}
        className="h-12 w-full rounded-xl border-[#e4e7ea] bg-white text-[#33363a] shadow-sm hover:bg-[#f7f8f9]"
      >
        <FaGoogle className="text-[#ea4335]" size={19} /> Google
      </Button>
    );
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""} aria-disabled={disabled}>
      <div ref={containerRef} className="min-h-12 w-full overflow-hidden rounded-xl" />
    </div>
  );
}
