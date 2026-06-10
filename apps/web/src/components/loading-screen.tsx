export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="space-y-4 text-center">
                <div className="text-4xl animate-pulse">⚡</div>
                <p className="text-muted-foreground text-sm">Loading DevFlow AI...</p>
            </div>
        </div>
    );
}