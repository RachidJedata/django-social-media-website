'use client'

import { GET_MY_PROFILE, REFRESH_MUTATION } from "@/lib/graphQL/queries";
import { GetMyProfileQuery } from "@/lib/types";
import { useLazyQuery, useMutation } from "@apollo/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { createContext, useEffect, useState } from "react";
import { useContext } from 'react';

const AuthContext = createContext<GetMyProfileQuery['myProfile']>(null);

const AuthComponent = ({ children }: { children: React.ReactNode }) => {
    const [myProfile, setMyProfile] = useState<GetMyProfileQuery['myProfile']>();
    const [refreshUser] = useMutation(REFRESH_MUTATION);
    const [getProfile] = useLazyQuery<GetMyProfileQuery>(GET_MY_PROFILE);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();


    useEffect(() => {
        const jwtToken = localStorage.getItem('JWTToken');

        const invalidateData = () => {
            localStorage.removeItem('JWTToken');

            setMyProfile(null);
            const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
            const target = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
            router.push(target);
        }

        const validate = async () => {
            if (!jwtToken) {
                invalidateData();
                return;
            }

            try {
                // First try to get profile
                const profileResult = await getProfile();

                if (profileResult.error || !profileResult.data?.myProfile) {
                    // If profile fails, try refresh
                    const responseRefresh = await refreshUser({
                        variables: { token: jwtToken },
                    });

                    if (responseRefresh.errors || !responseRefresh.data) {
                        invalidateData();
                        return;
                    }

                    // Save new token and retry profile
                    localStorage.setItem('JWTToken', responseRefresh.data.token);

                    const retryProfileResult = await getProfile();
                    if (retryProfileResult.error || !retryProfileResult.data?.myProfile) {
                        invalidateData();
                        return;
                    }

                    setMyProfile(retryProfileResult.data.myProfile);
                } else {
                    setMyProfile(profileResult.data.myProfile);
                }
            } catch (error) {
                console.error('Authentication error:', error);
                invalidateData();
            } finally {
                setIsLoading(false);
            }
        };

        validate();
    }, [getProfile, refreshUser, router, pathname, searchParams]);

    if (isLoading) {
        return <>Loading.....</>;
    }

    return (
        <AuthContext.Provider value={myProfile}>
            {children}
        </AuthContext.Provider>
    );
}

export function useUser() {
    const myProfile = useContext(AuthContext);
    return myProfile;
}

export default AuthComponent;