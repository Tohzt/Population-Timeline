import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
	message?: string;
	size?: "small" | "medium" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	message = "Loading population data...",
	size = "medium",
}) => {
	return (
		<div className={`loading-container ${size}`}>
			<div className="loading-spinner">
				<div className="spinner-ring"></div>
				<div className="spinner-ring"></div>
				<div className="spinner-ring"></div>
			</div>
			<p className="loading-message">{message}</p>
		</div>
	);
};

export default LoadingSpinner;
