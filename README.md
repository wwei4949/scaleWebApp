# SCALE Scheduler README


### Introduction to SCALE
Science Competitions Advocating for Learning Equity, or SCALE for short, is an organization affiliated with the Department of Chemistry & Biochemistry established with the intention of bridging the gap between the College of Computer, Mathematical, and Natural Sciences at the University of Maryland, College Park, and the greater Prince George's County community. SCALE partners with Prince George's County Public Elementary Schools to provide a means of establishing intervention in classrooms with the goal of fostering meaningful, unique, and hands-on competition between students that creates a positive learning environment, while simultaneously reinforcing the PGCPS curriculum.

### The Platform's Purpose
This platform offers a centralized digital hub where volunteers can efficiently upload their availability, preferences, and other necessary details. This seamless process ensures that volunteering efforts are optimized to benefit the students and schools that need them most.

### Addressing Challenges
The platform tackles several challenges inherent in coordinating volunteer efforts for an organization like SCALE:

1. **Scheduling Complexities:** With numerous volunteers, each with their unique schedules and preferences, manually coordinating everyone can be a difficult and time consuming task. This platform automates this process, ensuring optimal assignment of volunteers based on their availability.
   
2. **Real-time Updates:** The dynamic nature of volunteer availability can lead to last-minute changes. Our platform allows for real-time updates, ensuring that the schedule remains current and accurate.
   
3. **Scalability:** As SCALE grows and collaborates with more schools, the number of volunteers and the complexity of scheduling will increase. This platform is designed to scale effortlessly, accommodating a larger number of volunteers without compromising performance or user experience.

## Demos
![Volunteer Demo](https://github.com/wwei4949/scaleWebApp/blob/main/scale_scheduler/public/assets/volunteerDemo.gif)  
*Volunteer Functionality Demonstration*

![Admin Demo](https://github.com/wwei4949/scaleWebApp/blob/main/scale_scheduler/public/assets/adminDemo.gif)  
*Admin Functionality Demonstration*

## 
This platform is powered by a [Flask API](https://github.com/wwei4949/scale-scheduler-API), providing a robust backend to handle the data and logic operations. The system leverages Firebase authentication. The foundational structure of this authentication is extended from [this repository](https://github.com/WebDevSimplified/React-Firebase-Auth).

## Future Plans
- **UI/UX Overhaul:** Refine the user interface to improve experience for both volunteers and admins
- **Mobile Interface:** Ensure that the platform is responsive across various device sizes, especially on mobile phones and tablets
- **Notifications and Alerts:** Implement a notification system to alert volunteers about upcoming events, changes in schedules, or any other critical information
- **Calender Integration:** Integrate with calendar apps, email systems, or other third-party tools to streamline the workflow
- **Parameter Customization:** Administrators can set various parameters dynamically, including number of volunteers required per event and special roles or skills needed for specific tasks
- **Dynamic Event Management:** Administrators can define and manage multiple events simultaneously, including setting the date, time, venue, and other specifics of each event
