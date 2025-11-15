FROM eclipse-temurin:11-jdk

# Install dependencies (unzip + curl only)
RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2 (binary, no Python deps)
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws

# Install DynamoDB Local
RUN mkdir -p /home/dynamodblocal
WORKDIR /home/dynamodblocal
RUN curl -L https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz -o dynamodb_local_latest.tar.gz \
    && tar -xvzf dynamodb_local_latest.tar.gz \
    && rm dynamodb_local_latest.tar.gz

# Copy your entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set default environment variables for AWS CLI
ENV AWS_ACCESS_KEY_ID=fake
ENV AWS_SECRET_ACCESS_KEY=fake
ENV AWS_DEFAULT_REGION=ap-south-1
# ENV AWS_DEFAULT_REGION=ap-south-1
ENV AWS_PAGER=""

# Use entrypoint script to start DynamoDB and optionally create tables
ENTRYPOINT ["/docker-entrypoint.sh"]
