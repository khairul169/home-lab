// src/app/apps/lib.ts

import api from "@/lib/api";
import { showToast } from "@/stores/toastStore";

export const wakePcUp = async () => {
  try {
    await api.apps.wakepc.$post();
    showToast("Waking up PC...");
  } catch (err) {
    showToast("Cannot wake up the PC!", { type: "danger" });
  }
};
