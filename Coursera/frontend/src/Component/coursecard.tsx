

export default function CourseCard({ course }: { course: any }) {
    // Function to truncate text
    const truncateText = (text: string, wordLimit: number = 15) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    return (
        <a
            key={course.id}
            href={`/course/${course._id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            style={{ textDecoration: "none", color: "inherit" }}
        >
            
            <div className="p-0">
                <img src={course.img} alt={course.name} className="w-full h-40 object-cover" />
                
                <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.name}</h2>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {truncateText(course.description, 12)}
                    </p>
                    
                    <div className="flex items-center mb-3">
                        <img src={course.instructor?.img} alt={course.instructor?.username} className="w-8 h-8 rounded-full mr-2" />
                        <p className="text-xs text-gray-500">{course.instructor?.username}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{course.duration}</span>
                        <span className="font-semibold text-green-600">₹{course.price}</span>
                    </div>
                </div>
            </div>
        </a>
    );
}