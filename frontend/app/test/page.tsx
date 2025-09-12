import AuthComponent from '@/components/auth/AuthComponent';
import React from 'react';

const TestAppPage: React.FC = () => {
    return (

        <AuthComponent>
            <div style={{ padding: '2rem' }}>
                <h1>Welcome to the Test App Page</h1>
                <p>This is a sample Next.js page located at <code>/test/app.tsx</code>.</p>
            </div>
        </AuthComponent>
    );
};

export default TestAppPage;