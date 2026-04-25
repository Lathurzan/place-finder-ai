import { useEffect, useState } from "react";
import axios from "axios";

type Review = {
  id: number;
  user_id: number;
  place_id: number;
  rating: number;
  comment: string;
  created_at: string;
};

export default function PlaceReviews({ placeId, userId }: { placeId: number; userId?: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/api/reviews/place/${placeId}`).then(res => setReviews(res.data));
  }, [placeId]);

  const submit = async () => {
    setSubmitting(true);
    await axios.post("/api/reviews", { place_id: placeId, rating, comment }, { withCredentials: true });
    setRating(0);
    setComment("");
    const res = await axios.get(`/api/reviews/place/${placeId}`);
    setReviews(res.data);
    setSubmitting(false);
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Reviews</h3>
      {userId && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={n <= rating ? "text-amber-400" : "text-gray-300"}
                type="button"
              >★</button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Leave a comment..."
            className="w-full border rounded p-2 mb-2 text-sm"
            rows={2}
          />
          <button
            onClick={submit}
            disabled={submitting || rating === 0}
            className="bg-emerald-500 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
      <div>
        {reviews.length === 0 && <div className="text-gray-400 text-sm">No reviews yet.</div>}
        {reviews.map(r => (
          <div key={r.id} className="mb-3 border-b pb-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-400">{'★'.repeat(Math.round(r.rating))}</span>
              <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <div className="text-gray-800 dark:text-white text-sm">{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
