import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface UploadBoxProps {
  onFileSelect: (file: File, base64: string) => void;
  isUploading?: boolean;
  accept?: Record<string, string[]>;
}

export function UploadBox({ 
  onFileSelect, 
  isUploading = false,
  accept = { "application/pdf": [".pdf"] }
}: UploadBoxProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo data:application/pdf;base64,
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 10MB");
      return;
    }

    try {
      setSelectedFile(file);
      const base64 = await convertToBase64(file);
      onFileSelect(file, base64);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      setSelectedFile(null);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isUploading,
  });

  const clearFile = () => {
    setSelectedFile(null);
  };

  if (selectedFile) {
    return (
      <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {!isUploading && (
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="w-4 h-4" />
            </Button>
          )}
          {isUploading && (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="font-medium text-lg">
            {isDragActive ? "Solte o arquivo aqui" : "Arraste um PDF ou clique para selecionar"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Máximo 10MB • Apenas PDF
          </p>
        </div>
      </div>
    </div>
  );
}
