import React, { useState } from 'react';

interface SubscribeFormProps {
	productId: number;
	variationId: number;
	productTitle: string;
	userEmail: string;
}

interface ApiResponse {
	status: boolean;
	message: string;
	already_subscribed?: boolean;
	customer_email?: string;
	product_id?: number;
	variation_id?: number;
	unsubscribe_button?: {
		text: string;
	};
}

const SubscribeForm: React.FC<SubscribeFormProps> = ( {
	productId,
	variationId,
	productTitle,
	userEmail,
} ) => {
    console.log('SubscribeForm props:', { productId, variationId, productTitle, userEmail });
	const [ email, setEmail ] = useState( userEmail );
	const [ loading, setLoading ] = useState( false );
	const [ response, setResponse ] = useState<ApiResponse | null>( null );

	const handleSubmit = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		setLoading( true );
		setResponse( null );

		try {
			const res = await fetch( '/wp-json/notifima/v1/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					customer_email: email,
					product_id: productId,
					variation_id: variationId,
					product_title: productTitle,
				} ),
			} );

			const data: ApiResponse = await res.json();

			setResponse( data );
		} catch ( error ) {
			setResponse( {
				status: false,
				message: 'Something went wrong. Please try again.',
			} );
		} finally {
			setLoading( false );
		}
	};

	return (
		<div className="notifima-subscribe-form">
			<form onSubmit={ handleSubmit }>
				<input
					type="email"
					value={ email }
					onChange={ ( e ) => setEmail( e.target.value ) }
					placeholder="Enter your email"
					required
				/>

				<button type="submit" disabled={ loading }>
					{ loading ? 'Subscribing…' : 'Subscribe' }
				</button>
			</form>

			{ response && (
				<div
					className={
						response.status
							? 'notifima-success'
							: 'notifima-error'
					}
				>
					<p>{ response.message }</p>

					{ response.already_subscribed && (
						<button
							type="button"
							className="notifima-unsubscribe"
							onClick={ () => {
								// TODO: Call unsubscribe REST endpoint
								console.log(
									'Unsubscribe',
									response.customer_email,
									response.product_id,
									response.variation_id
								);
							} }
						>
							{ response.unsubscribe_button?.text ??
								'Unsubscribe' }
						</button>
					) }
				</div>
			) }
		</div>
	);
};

export default SubscribeForm;