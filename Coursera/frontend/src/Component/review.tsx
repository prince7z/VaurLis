import { atomFamily, useRecoilState } from "recoil";
import { useState } from "react";
import axios from "axios";
const BASE_URL = "http://localhost:5000";

const reviewHelpfulState = atomFamily({
    key: 'reviewHelpfulState',
    default: (param: number) => param,
});

export default function ReviewItem({ item }: { item: any }) {
    const [helpfulCount, setHelpfulCount] = useRecoilState(reviewHelpfulState(item.helpful));
    const [clicked, setClicked] = useState(false);

    const handleHelpfulClick = async () => {
        if (clicked) {
            setHelpfulCount(helpfulCount - 1);
            try {
                await axios.put(`${BASE_URL}/api/user/cmnt/helpful/${item._id}`, {
                    helpful: false
                }, {
                    headers: {
                        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
                    }
                });
            } catch (error) {
                alert("Error updating helpful status");
            }
        } else {
            setHelpfulCount(helpfulCount + 1);
            try {
                await axios.put(`${BASE_URL}/api/user/cmnt/helpful/${item._id}`, {
                    helpful: true
                }, {
                    headers: {
                        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
                    }
                });
            } catch (error) {
                alert("Error updating helpful status");
            }
        }
        setClicked(!clicked);
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg" key={item._id}>
            <li className="flex items-center mb-3">
                <a href={`/${item.user.username}` } className="flex items-center">
                <img src={item.user.img} alt={item.user.username} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <p className="font-semibold">{item.user.username}</p>
                    <p className="text-yellow-500">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</p>
                </div>
                </a>
            </li>
            <p className="text-gray-700 mb-2">{item.review}</p>
            <li>
                <button
                    onClick={handleHelpfulClick}
                    className={clicked ? "bg-blue-200" : ""}
                >
                    Helpful: {helpfulCount}
                </button>
            </li>
        </div>
    );
}