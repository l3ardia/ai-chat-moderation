'use client'

import { Provider } from "@/components/ui/provider"
import React, { JSX } from "react";

export default function Providers({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <Provider>
            {children}
        </Provider>
    );
}