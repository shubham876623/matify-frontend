import { useEffect, useState } from "react";
import api from "../api/axiosWithRefresh";

const Settings = () => {
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await api.get("/api/credits/");
        setCreditsRemaining(res.data.credits_remaining);
        setCreditsUsed(res.data.credits_used);
      } catch (err) {
        console.error("Failed to fetch credits", err);
      }
    };
    fetchCredits();
  }, []);

  const handleAddCredits = async () => {
    try {
      const res = await api.post("/api/create-razorpay-order/");
      const { order_id, razorpay_key_id, amount, currency } = res.data;

      const options = {
        key: razorpay_key_id,
        amount: amount.toString(),
        currency,
        name: "Matify Studio",
        description: "100 Credit Pack",
        order_id,
        handler: function (response) {
          alert("Payment Successful: " + response.razorpay_payment_id);
          window.location.reload();
        },
        prefill: {
          name: "Matify User",
          email: "user@example.com",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay session creation failed", err);
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Credits Counter</h2>

      <div className="flex gap-10 mb-6">
        <div className="w-48 h-32 border border-gray-300 rounded-lg flex items-center justify-center bg-white shadow">
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600">{creditsRemaining}</p>
            <p className="text-sm text-gray-500 mt-2">Credits Remaining</p>
          </div>
        </div>
        <div className="w-48 h-32 border border-gray-300 rounded-lg flex items-center justify-center bg-white shadow">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-500">{creditsUsed}</p>
            <p className="text-sm text-gray-500 mt-2">Credits Used</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleAddCredits}
        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-700"
      >
        Add Credits
      </button>
    </div>
  );
};

export default Settings;
