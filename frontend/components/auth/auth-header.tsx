'use client'

import Image from "next/image";
import { useUser } from "./AuthComponent";
import Link from "next/link";

export default function AuthHeader() {
    const user = useUser();

    return (<>
        {/* For Now it is empty , but  */}
        <Link href={`/profile/${user?.user.username}`} className="flex items-center p-4 bg-gradient-to-r from-purple-700 to-blue-600 shadow-md fixed w-full top-0 z-50">
            {/* <div className="flex items-center p-4 mb-4 bg-gradient-to-r from-purple-700 to-blue-600 shadow-md fixed w-full "> */}
            <Image
                width={40}
                height={40}
                src={user?.profileimg || "/default-profile.png"}
                alt=""
                className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow"
            />
            <div>
                <div className="font-semibold text-white text-lg">
                    {user?.user?.firstName || ""} {user?.user?.lastName || ""}
                </div>
                <div className="text-gray-200 text-base">
                    @{user?.user?.username}
                </div>
            </div>
        </Link>
    </>);
}