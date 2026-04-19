type Props = {
  name: string;
  description: string;
};

const PlaceCard = ({ name, description }: Props) => {
  return (
    <div className="border p-3 rounded">
      <h3 className="font-bold">{name}</h3>
      <p>{description}</p>
    </div>
  );
};

export default PlaceCard;
