import jsPDF from "jspdf";

export default function ItineraryPDFExport({ itinerary }: { itinerary: any }) {
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(itinerary.title, 10, 20);
    doc.setFontSize(12);
    if (itinerary.days) {
      itinerary.days.forEach((day: any, i: number) => {
        doc.text(`Day ${i + 1}: ${day.title || ''}`, 10, 30 + i * 20);
        if (day.places) {
          day.places.forEach((place: any, j: number) => {
            doc.text(`- ${place.name}: ${place.description || ''}`, 15, 36 + i * 20 + j * 6);
          });
        }
      });
    }
    doc.save(`${itinerary.title || 'itinerary'}.pdf`);
  };

  return (
    <button
      onClick={exportPDF}
      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all ml-2"
    >
      Export PDF
    </button>
  );
}
