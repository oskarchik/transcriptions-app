<template>
  <div class="container mx-auto py-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Files Dashboard</h1>
      <Button @click="logoutUser" variant="outline" size="icon">
        <LogOutIcon class="h-5 w-5" />
      </Button>
    </div>

    <div class="flex justify-center items-center mt-6 gap-6">
      <Button
        @click="previousPage"
        :disabled="currentPage === 0"
        class="px-6 py-3 text-lg font-medium rounded-lg disabled:opacity-50"
      >
        <ChevronLeftIcon class="h-5 w-5" />
        <span>Prev</span>
      </Button>

      <span class="text-gray-700 font-semibold text-xl">
        Page {{ currentPage + 1 }}
      </span>

      <Button
        @click="nextPage"
        :disabled="!lastEvaluatedKeys[currentPage]"
        class="px-6 py-3 text-lg font-medium rounded-lg disabled:opacity-50"
      >
        <span>Next</span>
        <ChevronRightIcon class="h-5 w-5" />
      </Button>
    </div>

    <!-- Botón para subir archivo -->
    <div class="mb-4 flex items-center gap-4">
      <Input
        ref="fileInput"
        type="file"
        class="hidden"
        @change="handleFileChange"
        accept=".mp3,.wav"
      />
      <Button @click="triggerFileInput">Upload File</Button>
      <span v-if="selectedFile" class="text-gray-600">
        {{ selectedFile.name }}
      </span>
    </div>

    <!-- Tabs para diferentes vistas -->
    <div class="mt-8">
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <!-- Tabla de archivos usando el componente Table de shadcn/ui -->
    <div>
      <Table>
        <TableCaption>Files dashboard</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>File Id</TableHead>
            <TableHead>User Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="file in filteredFiles"
            :key="file.fileId"
            class="hover:bg-muted/50"
          >
            <TableCell>{{ file.fileId }}</TableCell>
            <TableCell>{{ truncateText(file.userId, 8) }}</TableCell>
            <TableCell class="font-medium">{{ file.name }}</TableCell>
            <TableCell>{{ getLanguageName(file.language) }}</TableCell>
            <TableCell>
              <div class="flex items-center">
                {{ file.type }}
              </div>
            </TableCell>
            <TableCell>
              <span
                :class="getStatusBadgeClass(file.status)"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >
                {{ getStatusText(file.status) }}
              </span>
            </TableCell>
            <TableCell>{{ formatDate(file.updatedAt) }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  :disabled="file.status !== 3"
                  @click="handleFileDownload(file.fileId, file.userId)"
                >
                  <DownloadIcon class="h-4 w-4" />
                </Button>
                <!-- <Button
                  variant="outline"
                  size="icon"
                  class="text-destructive hover:text-destructive"
                  disabled
                  alt="comming soon"
                >
                  <TrashIcon class="h-4 w-4" />
                </Button> -->
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"], // Ruta protegida
});
const config = useRuntimeConfig();
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/stores/auth";
import {
  formatDate,
  getLanguageName,
  truncateText,
  getStatusBadgeClass,
  orderResults,
  getStatusText,
} from "@/utils/utils";

import {
  FileTextIcon,
  MusicIcon,
  FileIcon,
  DownloadIcon,
  TrashIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-vue-next";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileItem {
  fileId: string;
  userId: string;
  name: string;
  language: string | null;
  type: string;
  status: number;
  updatedAt: string;
}

const authStore = useAuth();
const router = useRouter();
const files = ref<FileItem[]>([]);
const pagination = ref({
  currentPage: 0,
  totalPages: 0,
  lastEvaluatedKey: null,
  isLoading: false,
});

const selectedFile = ref(null);
const allowedExtensions = [".mp3", ".wav"];
const maxFileSize = 20 * 1024 * 1024; // 20MB en bytes
const activeTab = ref("all");

const lastEvaluatedKey = ref<string | null>(null);
const lastEvaluatedKeys = ref([]);
const previousKeys = ref([]);
const pages = ref([]);
const currentPage = ref(0);
const isLoading = ref(false);
const fileInput = ref(null);
const userId = ref(authStore.userId);

const BASE_API_URL = config.public.baseApiUrl;

const triggerFileInput = () => {
  if (fileInput.value?.$el) {
    fileInput.value.$el.click();
  }
};

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (
      file.size > maxFileSize ||
      !allowedExtensions.some((ext) => file.name.endsWith(ext))
    ) {
      showAlert(
        "Invalid file. Please upload a valid .mp3 or .wav file under 20MB."
      );
      return;
    }
    selectedFile.value = file;
    handleFileUpload(file);
  }
};

const handleFileUpload = async () => {
  if (!selectedFile.value) {
    return;
  }
  const user = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const file = selectedFile.value;

  const fileName = file.name;
  const size = file.size / 1024 / 1024;

  const [originalFilename, fileExtension] = fileName.split(".");

  const url = `${BASE_API_URL}/signed-url?userId=${user}&fileName=${fileName}&size=${size}&action=upload`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to get upload URL");

    const resBody = await response.json();
    const { signedUrl } = resBody;
    console.log("filetipe ", file.types);
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) throw new Error("Failed to upload file");

    alert("File upload process successfully started!");

    selectedFile.value = null;
    fileInput.value.value = null;

    window.location.reload();
  } catch (error) {
    console.error("Upload error:", error);
    alert("File upload failed.");
  }
};

const fetchFiles = async (reset = false, key = null) => {
  if (isLoading.value) return;
  isLoading.value = true;
  const userId = localStorage.getItem("userId");

  let url = `${BASE_API_URL}/transcriptions`;

  if (!reset && (key || lastEvaluatedKey.value)) {
    const lastEvaluatedKeyString =
      key || JSON.stringify(lastEvaluatedKey.value);
    url += `?lastEvaluatedKey=${encodeURIComponent(lastEvaluatedKeyString)}`;
  }

  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  };
  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (reset) {
      pages.value = [orderResults(data.items)];
      lastEvaluatedKeys.value = [data.lastEvaluatedKey || null];
      currentPage.value = 0;
    } else {
      pages.value.push(orderResults(data.items));
      lastEvaluatedKeys.value.push(data.lastEvaluatedKey || null);
      currentPage.value++;
    }

    if (!reset && lastEvaluatedKey.value) {
      previousKeys.value.push(lastEvaluatedKey.value);
    }

    files.value = pages.value[currentPage.value];
  } catch (error) {
    console.error("Error fetching files:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleFileDownload = async (fileId: string, user: string) => {
  const url = `${BASE_API_URL}/signed-url?fileId=${fileId}&userId=${user}&action=download`;

  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) throw new Error("Failed to get download URL");

    const resBody = await response.json();
    const { signedUrl } = resBody;

    if (signedUrl) {
      const link = document.createElement("a");
      link.href = signedUrl;
      link.setAttribute("download", "");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      throw new Error("signedUrl is undefined or invalid");
    }
  } catch (error) {
    console.log("🚀 ~ handleFileDownload ~ error:", error);
  }
};

onMounted(() => {
  fetchFiles(true);
});

const logoutUser = () => {
  authStore.logout();
  router.push("/");
};

const filteredFiles = computed(() => {
  const statusFilters = {
    all: () => files.value,
    processing: () =>
      files.value.filter((file) => file.status >= 0 && file.status <= 2),
    processed: () => files.value.filter((file) => file.status === 3),
    error: () => files.value.filter((file) => file.status === 4),
  };

  return (statusFilters[activeTab.value] || statusFilters.all)();
});

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    files.value = pages.value[currentPage.value];
  }
};

const nextPage = () => {
  if (lastEvaluatedKeys.value[currentPage.value]) {
    fetchFiles(false, lastEvaluatedKeys.value[currentPage.value]);
  }
};
</script>
