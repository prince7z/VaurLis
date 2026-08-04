export default function CourseCard({ course }: { course: any }) {
    return (
        <a
            key={course._id || course.id}
            href={`/course/${course._id || course.id}`}
            className="group flex flex-col w-full h-[345px] bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200"
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div className="relative w-full h-[155px] bg-slate-100 overflow-hidden flex-shrink-0">
                <img 
                    src={course.img || 'https://via.placeholder.com/400x225?text=Course'} 
                    alt={course.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                {course.institution && (
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                        {course.institution}
                    </span>
                )}
            </div>
            
            <div className="flex flex-col justify-between flex-1 p-4">
                <div className="space-y-1.5">
                    <h2 className="text-sm font-semibold text-slate-900 line-clamp-2 h-[2.7em] leading-snug group-hover:text-blue-600 transition-colors">
                        {course.name}
                    </h2>
                    <div className="flex items-center gap-2 pt-1">
                        {course.instructor?.img ? (
                            <img src={course.instructor.img} alt={course.instructor.username} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                {(course.instructor?.username || 'I').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs text-slate-500 font-medium truncate">{course.instructor?.username || 'Instructor'}</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-sm">★</span>
                        <span className="text-slate-600 font-semibold text-xs">{(course.rating || 0).toFixed(1)}</span>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded ${course.price === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                </div>
            </div>
        </a>
    );
}