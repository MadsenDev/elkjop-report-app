import Modal from './Modal';
import Button from './ui/Button';

// NEW ▸ Desktop side: Tauri plugin that can write images
import { writeImage } from '@tauri-apps/plugin-clipboard-manager';

// Utility: data-URL → Blob (unchanged)
function dataURLtoBlob(dataurl: string): Blob {
  const [header, base64] = dataurl.split(',');
  const mime = /:(.*?);/.exec(header)![1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  onDownload: () => void;
}

export default function ImagePreviewModal({ isOpen, onClose, imageUrl, title, onDownload }: ImagePreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-lg overflow-auto"
          style={{ maxHeight: '70vh' }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[65vh] mx-auto block object-contain"
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button
            onClick={onDownload}
            color="green"
            className="flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Image
          </Button>
        </div>
      </div>
    </Modal>
  );
}