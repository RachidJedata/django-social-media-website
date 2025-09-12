'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const AuthComponent = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(() => {

        const jwtToken = localStorage.getItem('jwtToken');
        const jwtTokenRefresh = localStorage.getItem('jwtTokenRefresh');


        const invalidateData = () => {
            localStorage.removeItem('jwtToken')
            localStorage.removeItem('jwtTokenRefresh')
            // Build the current URL (pathname + existing query string)
            const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
            const target = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
            router.push(target)
        }

        if (!jwtToken || !jwtTokenRefresh)
            invalidateData()
        else {
            const validate = async () => {
                const fetchData = fetch('http://localhost:8000/auth/jwt/verify/',
                    {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            'token': jwtToken
                        }),
                    }
                )

                const response = await fetchData;

                if (response.status === 401) //Unauthorized 
                {

                    const fetchData = fetch('http://localhost:8000/auth/jwt/refresh/',
                        {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                'refresh': jwtTokenRefresh
                            }),
                        }
                    )

                    const response = await fetchData

                    if (response.status === 401) {
                        invalidateData()
                    }
                    else {
                        //pass
                        const data = await response.json()
                        localStorage.setItem('jwtToken', data.access)

                        setIsLoading(false)
                    }

                } else {
                    //pass
                    setIsLoading(false)
                }
            }
            validate()
        }





    }, []);

    if (isLoading)
        return (<>Loading.....</>);

    return (<>{children}</>);
}

export default AuthComponent;