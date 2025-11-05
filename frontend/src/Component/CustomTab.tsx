import CourseCard from "./coursecard";

// Transaction-related interfaces returned by the backend `/transactions` endpoint
export interface IUserRef {
	_id?: string;
	username: string;
	img?: string;
}

export interface IForRef {
	_id?: string;
	name?: string;
}

export interface ITransaction {
	_id?: string;
    isSentorRecived: 'sent' | 'received';
	From: IUserRef; // sender
	To: IUserRef; // receiver
	For: IForRef; // related course or item
	status: 'pending' | 'completed' | 'failed';
	timestamp: string | Date;
	amount: number;
}


interface TTabbProps {
    label: string;
    Data: ITransaction[];
}

function TTabb({label, Data}: TTabbProps) {
    return (
        <div>
            <h3>{label}</h3>
            {Data && Data.length > 0 ? (
                Data.map((item) => (
                    <div key={item._id} className="mb-4 p-4 border rounded">
                        {item.isSentorRecived === 'sent' ? (
                            <div className="bg-red-300">
                                <p className="text-gray-600">Transaction ID: {item._id}</p>
                                <div className="mt-2">
                                    <span className="font-semibold">To: </span>
                                    <a 
                                        href={`/user/${item.To?.username}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src={item.To?.img || "https://www.gravatar.com/avatar/?d=mp&f=y"}
                                            alt={item.To?.username}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span>{item.To?.username}</span>
                                    </a>
                                </div>
                                <div className="mt-2">
                                    <span className="font-semibold">For: </span>
                                    <a 
                                        href={`/course/${item.For?._id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        {item.For?.name}
                                    </a>
                                </div>
                                <p className="mt-2">
                                    <span className="font-semibold">Amount: </span>
                                    ${item.amount}
                                </p>
                                <p className="mt-2">
                                    <span className="font-semibold">Status: </span>
                                    <span className={`${
                                        item.status === 'completed' ? 'text-green-600' : 
                                        item.status === 'failed' ? 'text-red-600' : 
                                        'text-yellow-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                </p>
                                <p className="mt-2 text-gray-500">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        ) : item.isSentorRecived === 'received' ? (
                            <div className="bg-green-300">
                                <p className="text-gray-600">Transaction ID: {item._id}</p>
                                <div className="mt-2">
                                    <span className="font-semibold">From: </span>
                                    <a 
                                        href={`/user/${item.From?.username}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src={item.From?.img || "https://www.gravatar.com/avatar/?d=mp&f=y"}
                                            alt={item.From?.username}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span>{item.From?.username}</span>
                                    </a>
                                </div>
                                <div className="mt-2">
                                    <span className="font-semibold">For: </span>
                                    <a 
                                        href={`/course/${item.For?._id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        {item.For?.name}
                                    </a>
                                </div>
                                <p className="mt-2">
                                    <span className=" font-semibold">Amount: </span>
                                    ${item.amount}
                                </p>
                                <p className="mt-2">
                                    <span className="font-semibold">Status: </span>
                                    <span className={`${
                                        item.status === 'completed' ? 'text-green-600' : 
                                        item.status === 'failed' ? 'text-red-600' : 
                                        'text-yellow-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                </p>
                                <p className="mt-2 text-gray-500">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        ) : null}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No transactions found</p>
            )}
        </div>
    );
}

interface Course {
    _id: string;
    [key: string]: any; // allow other properties that CourseCard might need
}

interface TabbProps {
    label: string;
    Data: Course[];
}

function Tabb({label, Data}: TabbProps) {
    return (
        <div>
            <h3>{label}</h3>
            {Data && Data.length > 0 ? (
                Data.map((course) => (
                    <div key={course._id} className="min-w-[280px] flex-shrink-0">
                        <CourseCard course={course} />
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No courses found</p>
            )}
        </div>
    );
}
export {Tabb,TTabb};
