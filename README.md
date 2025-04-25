# Leave Management System

This project consists of a Spring Boot backend (`leave-management-be`) and a React frontend (`leave-flow-frontend`) for managing employee leave requests.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop)

## Running the Application with Docker Compose

This is the recommended way to run the application for development and testing.

1.  **Clone the Repository:**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Build and Run Containers:**
    From the root directory (where `docker-compose.yml` is located), run:

    ```bash
    docker-compose up --build -d
    ```

    - `--build`: Forces Docker Compose to build the images based on the `Dockerfile`s before starting the containers.
    - `-d`: Runs the containers in detached mode (in the background).

    The first time you run this, it might take a while to download base images and build the applications.

3.  **Backend Setup:** The backend service depends on the PostgreSQL database. Liquibase is configured to automatically set up the database schema when the backend container starts.

4.  **Accessing the Application:**

    - **Frontend:** Open your web browser and navigate to `http://localhost:8081`
    - **Backend API:** The backend API is accessible at `http://localhost:8080` (e.g., `http://localhost:8080/api/v1/...`)

5.  **Stopping the Application:**
    To stop the containers, run:
    ```bash
    docker-compose down
    ```
    To stop and remove the data volume (useful for a clean restart):
    ```bash
    docker-compose down -v
    ```

## Basic Testing Steps

1.  Navigate to `http://localhost:8081`.
2.  **Register:** Click the "Register" tab, fill in the details (the first user registered will be an ADMIN), and submit.
3.  **Login:** Use the credentials you just registered to log in.
4.  **Submit Leave:** Navigate to the Dashboard and click "New Leave Request". Fill in the form and submit.
5.  **View History:** Navigate to "Leave Requests" from the sidebar to see your submitted request.
6.  **(If Admin):** Navigate to "All Requests" from the sidebar to view all user requests. Try filtering, approving/rejecting a request, and exporting the CSV.
7.  **Logout:** Use the user menu in the top-right corner to log out.

## Docker Hub Images (Optional)

If pre-built images are available on Docker Hub, you can modify the `docker-compose.yml` file to use `image:` instead of `build:` for the `backend` and `frontend` services.

- **Backend Image:** `your-dockerhub-username/leave-management-be:latest` (Replace with actual image name)
- **Frontend Image:** `your-dockerhub-username/leave-flow-frontend:latest` (Replace with actual image name)

To push the images manually after building locally:

```bash
# Build images locally (if not already done by docker-compose up --build)
docker build -t your-dockerhub-username/leave-management-be:latest ./leave-management-be
docker build -t your-dockerhub-username/leave-flow-frontend:latest ./leave-flow-frontend

# Login to Docker Hub (enter credentials when prompted)
docker login

# Push images
docker push your-dockerhub-username/leave-management-be:latest
docker push your-dockerhub-username/leave-flow-frontend:latest
```

Remember to replace `your-dockerhub-username` with your actual Docker Hub username.
