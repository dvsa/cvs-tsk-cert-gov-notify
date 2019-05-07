FROM python:latest

ENV AWS_ACCESS_KEY_ID=accessKey1
ENV AWS_SECRET_ACCESS_KEY=verySecretKey1

# Copy certificates
COPY tests/resources/certificates /usr/src/cvs-tsk-cert-gov-notify/certificates

# Install dependencies
RUN pip install --upgrade awscli \
    && apt-get clean

## Script from the web to wait for S3 to start up
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

## Run the wait script until SQS is up
## Create buckets and add the signature
## Start
CMD /wait && \
aws --endpoint-url=http://s3:7000 s3 mb s3://cvs-cert-local && \
echo "Adding certificates" && \
aws s3api put-object --endpoint-url=http://s3:7000 \
    --bucket cvs-cert-local --key 1_1B7GG36N12S678410_1.pdf \
    --body /usr/src/cvs-tsk-cert-gov-notify/certificates/1_1B7GG36N12S678410_1.pdf \
    --metadata Content-Type=application/octet-stream,cert-index=1,cert-type=PSV_PRS,date-of-issue="11 March 2019",file-format=pdf,file-size=306784,test-type-name="Annual test",test-type-result=prs,total-certs=2,vrm=BQ91YHQ,email=cvs.dev1@dvsagov.onmicrosoft.com && \
aws s3api put-object --endpoint-url=http://s3:7000 \
    --bucket cvs-cert-local --key 1_1B7GG36N12S678410_2.pdf \
    --body /usr/src/cvs-tsk-cert-gov-notify/certificates/1_1B7GG36N12S678410_2.pdf \
    --metadata Content-Type=application/octet-stream,cert-index=2,cert-type=VTP30,date-of-issue="11 March 2019",file-format=pdf,file-size=227059,test-type-name="Annual test",test-type-result=fail,total-certs=2,vrm=BQ91YHQ,email=cvs.dev1@dvsagov.onmicrosoft.com
