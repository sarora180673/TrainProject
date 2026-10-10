FROM python:3.12

# Set the working directory inside the container
WORKDIR /testapp

# Copy the requirements file first to leverage Docker cache tracking
COPY ./requirements.txt /testapp/requirements.txt

# Install the application dependencies
RUN pip install --no-cache-dir --upgrade -r /testapp/requirements.txt

# Copy the application folder into the container
COPY ./src /testapp/src
COPY ./.env /testapp
COPY ./.env /testapp/src/

# Run the FastAPI application using the official 'fastapi run' command
CMD ["python",  "/testapp/src/main.py"] 
