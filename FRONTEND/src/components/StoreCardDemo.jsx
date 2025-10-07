import React from 'react';
import StoreCard from './storeCard';

// Demo component to showcase StoreCard functionality
export default function StoreCardDemo() {
    const demoStore = {
        id: 1,
        name: "Demo Store",
        storeName: "Demo Store",
        email: "demo@store.com",
        address: "123 Main Street, City, State 12345",
        phone: "+1 (555) 123-4567",
        website: "https://demostore.com",
        owner_name: "John Doe",
        description: "This is a demo store to showcase the StoreCard component functionality. It includes all the features like rating, store details, and interactive elements.",
        created_at: "2024-01-15T10:30:00Z",
        average_rating: 4.2,
        total_ratings: 15,
        user_rating: 0
    };

    const handleRatingUpdate = (storeId, rating) => {
        console.log(`Rating updated for store ${storeId}: ${rating}`);
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">StoreCard Component Demo</h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Demo with user actions enabled */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">With User Actions</h2>
                        <StoreCard
                            store={demoStore}
                            onRatingUpdate={handleRatingUpdate}
                            isUser={true}
                            showActions={true}
                        />
                    </div>

                    {/* Demo with user actions disabled */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Read-Only Mode</h2>
                        <StoreCard
                            store={{ ...demoStore, user_rating: 4 }}
                            onRatingUpdate={handleRatingUpdate}
                            isUser={false}
                            showActions={false}
                        />
                    </div>

                    {/* Demo with existing user rating */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">With Existing Rating</h2>
                        <StoreCard
                            store={{ ...demoStore, user_rating: 5 }}
                            onRatingUpdate={handleRatingUpdate}
                            isUser={true}
                            showActions={true}
                        />
                    </div>
                </div>

                <div className="mt-8 p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Features Demonstrated</h2>
                    <ul className="space-y-2 text-gray-600">
                        <li>• Store information display (name, address, contact details)</li>
                        <li>• Overall rating display with star visualization</li>
                        <li>• Interactive rating system with submit button</li>
                        <li>• Rating selection, submission, and update functionality</li>
                        <li>• Rating deletion with confirmation</li>
                        <li>• User-only rating permissions</li>
                        <li>• Real-time rating updates and state management</li>
                        <li>• Responsive design with hover effects</li>
                        <li>• Loading states and error handling</li>
                        <li>• Conditional rendering based on user permissions</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
