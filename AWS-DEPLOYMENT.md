
# AWS Deployment Instructions for XRPL Bot

## Prerequisites
1. Install AWS CLI: https://aws.amazon.com/cli/
2. Install EB CLI: `pip install awsebcli`
3. Configure AWS credentials: `aws configure`

## Deployment Steps

### Initial Deployment
1. Navigate to the project directory:
   ```
   cd C:\Users\mikev\CascadeProjects\my_new_project\xrpl-bot
   ```

2. Initialize EB application:
   ```
   eb init xrpl-liquidity-bot --platform node.js --region us-east-1
   ```
   
   Follow the prompts to select your region and configure settings.

3. Create environment and deploy:
   ```
   eb create xrpl-production
   ```

### Subsequent Deployments
To deploy updates:
```
eb deploy
```

## Accessing Your Application
After deployment, your application will be available at:
- Bot API: http://YOUR_EB_URL/
- Institutional Dashboard: http://YOUR_EB_URL/dashboard/

## Environment Variables
Set these in the AWS Elastic Beanstalk Console under Configuration > Software:
- XRPL_WALLET_SEED
- XRPL_WALLET_ADDRESS
- XRPL_SERVER
- MAX_TRANSACTION_AMOUNT
- MAX_DAILY_VOLUME
- STOP_LOSS_PERCENTAGE
- EMERGENCY_SHUTDOWN_THRESHOLD
- ALERT_THRESHOLD
- ALERT_WEBHOOK_URL
- ALERT_EMAIL

## Monitoring and Logs
- View logs: `eb logs`
- SSH into instance: `eb ssh`
