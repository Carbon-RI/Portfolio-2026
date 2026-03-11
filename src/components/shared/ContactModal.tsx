"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";

interface ContactModalProps {
  onClose: () => void;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export const ContactModal = ({ onClose }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("loading");
      setErrorMessage("");

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setStatus("success");
          setFormData({ name: "", email: "", message: "" });
          setTimeout(onClose, 2500);
        } else {
          const data = await response.json();
          setErrorMessage(data.message || "Failed to send message.");
          setStatus("error");
        }
      } catch {
        setErrorMessage("Network error. Please try again later.");
        setStatus("error");
      }
    },
    [formData, onClose]
  );

  const isFormDisabled = status === "loading" || status === "success";

  return (
    <Modal
      onClose={onClose}
      overlayClassName="backdrop-blur-sm"
      panelClassName="max-w-xl p-8 md:p-12 shadow-2xl"
    >
        <h3 className="text-xl mb-10 text-center">Contact</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {status === "error" && (
            <div className="alert-error">{errorMessage}</div>
          )}
          {status === "success" && (
            <div className="alert-success text-center">
              Message sent successfully.
            </div>
          )}

          <div>
            <label htmlFor="contact-name" className="app-label">
              Name
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className="app-input"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="app-label">
              Email
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className="app-input"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="app-label">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className="app-input resize-none"
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={isFormDisabled}
            className="w-full"
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </Button>
        </form>

        {!isFormDisabled && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="mt-6 w-full text-layer-medium hover:text-content-primary"
          >
            Close
          </Button>
        )}
    </Modal>
  );
};
