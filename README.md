*This was a project developed for UTSA Rowdyhacks 2025*

## What is Hangout Finder?
When going out to the club, it's hard to tell if the club you're going to is going to be lively or completely empty. Time and time again, society has faced the struggle of making the trek to a new club or bar just to find that there's hardly anyone in it. We were inspired to help this issue, by developing Hangout Finder, a website that lets users see how busy places before they even leave home.
**Hangout Finder** finds nearby, busy nightclubs and bars, making it fast and easy to find our what bumping club to go to on a night out. It searches for nearby venues and shows how busy it is in real time, as well has its ratings, a brief description, and more. By analyzing anonymized cellphone location data, our site estimates foot traffic across the city, giving an accurate picture of which places are packed and which are quiet.

## Technologies Used
On the backend, we used BestTime API to query nearby business, get the busyness of those businesses, and extract additional information about them. Using this, we constructed a list of locations based on the user's location. We also utilized Google-Places API to gather more information about each venue that could be useful to the user. On frontend, we opted for a simplistic, nightlife-inspired design so as to not distract from the focus of the site. We used HTML, CSS, JavaScript, and a bit of Node.js to construct our frontend.

## Future Plans for Hangout Finder
We aim to add advanced search and filtering options. Users will be able to search by venue type (bar, club, etc.), age restrictions, and more. We also made plans to implement an Events feature, which will search for nearby and upcoming events- such as concerts, festivals, etc.- similar to how we searched for nearby venues. We plan to use EventBright API, a tool which shares upcoming events in a given area, to accomplish this. The point of our website it to make going out easier, both now and in the future. While the Venues tab accomplishes the "now", the Events tab will make it easier for our users to plan to go out in the future as well.

## How to Use
In the file proxy.js, insert API keys into the labeled sections.
```javascript
const BESTTIME_API_KEY = /*BestTime Private API Key Here*/;
const GOOGLE_API_KEY = /*Google Private API Key Here*/;
```
In terminal, navigate to the directory and execute the following commands to set up Node.js and run the site:
```powershell
npm install
node proxy.js
```
Then, navigate to index.html, enable location sharing, and get partying.
