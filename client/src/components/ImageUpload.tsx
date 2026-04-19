type Props = {
  onUpload: (file: File) => void;
};

const ImageUpload = ({ onUpload }: Props) => {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files) {
          onUpload(e.target.files[0]);
        }
      }}
    />
  );
};

export default ImageUpload;
