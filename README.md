# CinemaChain

Hi, my name is luka jgharkava. This is Kino XII, a cinema booking website I built with Angular. You can browse films, check showtimes across venues, pick your seats and buy tickets.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.1.


# Tech stack

I used Angular 22 with standalone components and signals for state. The app runs without Zone.js, so signals drive the change detection. For data I used Angular's HttpClient and RxJS. Everything comes from the Kino XII REST API, and the project is set up with server-side rendering.

# Login / register: 

Login and registration open in a popup. I wrote an HTTP interceptor that adds the token to every request. If the token expires, it opens the login popup and then repeats the request that failed. I also used route guards, so pages like the profile and buying tickets are only for logged-in users.

# Sessions page: 

On the Sessions page you can filter showtimes by venue, date, age rating, format, language and time of day, and sort them. The filters are sent to the API as arrays, and the results are paginated.

# Buy ticket page: 

Clicking Buy ticket opens the film's page, with its details and sessions for the next seven days, grouped by venue and hall. If your age is below the film's rating, the sessions are disabled.

# Booking modal: 
Booking has three steps. First, the seat map. It's drawn from the API, because every hall has a different layout, with sections, aisles and gaps. You can pick up to three seats and choose Adult, Student or Child for each one. Child tickets are hidden for 16+ and 18+ films.
    Click Next: 
"When you continue, the seats are held for 8 minutes, and this timer counts down. If time runs out, you go back to seat selection with a warning. If someone else takes a seat at the same moment, the app tells you which seat was lost, keeps the rest of your selection and reloads the map."
    Fill checkout
In checkout, your name, email and phone are filled in from your profile. Payment is simulated. After paying, you see the confirmation with your order number.

# Profile → My Tickets

In My Profile you can update your personal information. Under My Tickets you'll see upcoming and past orders, and you can refund a ticket up to two hours before the session.
