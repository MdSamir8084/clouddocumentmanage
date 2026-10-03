# ☁️ Cloud Student Portal 
 
### 🚀 AWS | Docker | Node.js | MySQL | GitHub Actions | S3 | RDS 
 
A cloud-based student portal developed with **Node.js, Express, MySQL and JavaScript** and deployed using AWS cloud services. 
 
The project was built step-by-step, starting from local development in **VS Code**, followed by GitHub, CI/CD, Docker, AWS EC2 deployment and finally integration with services such as **S3, RDS, Load Balancer and Auto Scaling**. 
 
--- 
 
## 📌 Project Overview 
 
The application provides a simple platform where users can:
 
* 👤 Register and login 
* 📄 Upload documents 
* 📦 Store uploaded files 
* 🗄️ Store application data 
* 🔐 Manage authenticated users 
* 👨‍💼 Provide admin functionality 
 
The main purpose of this project was not only to build the application, but also to understand **how a real application is developed, containerized, deployed and connected with different AWS services.**
 
--- 
 
# 🏗️ Architecture 
 
```text 
                         👨‍💻 DEVELOPER 
                              │ 
                              ▼ 
                         🖥️ VS CODE 
                              │ 
                         git push 
                              │ 
                              ▼ 
                       🐙 GITHUB 
                     Source Repository 
                              │ 
                              ▼ 
                  ⚙️ GITHUB ACTIONS 
                         CI / CD 
                              │ 
                       Docker Build 
                              │ 
                              ▼ 
                       🐳 DOCKER HUB 
                       Image Registry 
                              │ 
                       docker pull 
                              │ 
                              ▼ 
        ┌─────────────────────────────────────────┐ 
        │                  AWS VPC                 │ 
        │                                          │ 
        │              🌐 INTERNET                 │ 
        │                  │                       │ 
        │                  ▼                       │ 
        │          ⚖️ APPLICATION LOAD             │ 
        │             BALANCER (ALB)               │ 
        │                  │                       │ 
        │                  ▼                       │ 
        │           🎯 TARGET GROUP                │ 
        │                  │                       │ 
        │          ┌───────┴────────┐              │ 
        │          ▼                ▼              │ 
        │       🖥️ EC2-1         🖥️ EC2-2         │ 
        │       🐳 Docker         🐳 Docker         │ 
        │          │                │              │ 
        │          └───────┬────────┘              │ 
        │                  │                       │ 
        │        ┌─────────┴─────────┐             │ 
        │        ▼                   ▼             │ 
        │   🪣 AMAZON S3         🗄️ AMAZON RDS     │ 
        │   File Storage          MySQL Database   │ 
        │                                          │ 
        │   🔐 IAM + Security Groups               │ 
        │   💾 EBS Storage                         │ 
        └─────────────────────────────────────────┘ 
``` 
 
--- 
 
# 🔄 Complete Project Workflow 
 
```text 
👨‍💻 VS Code 
     │ 
     ▼ 
🐙 GitHub 
     │ 
     ▼ 
⚙️ GitHub Actions 
     │ 
     ▼ 
🐳 Docker Build 
     │ 
     ▼ 
🐳 Docker Hub 
     │ 
     ▼ 
☁️ AWS EC2 
     │ 
     ▼ 
🐳 Docker Container 
     │ 
     ▼ 
🌐 Node.js Application 
     │ 
     ├───────────────► 🪣 S3 
     │                  Documents / Files 
     │ 
     └───────────────► 🗄️ RDS 
                        MySQL Data 
                              
     EC2 Instances 
          │ 
          ▼ 
    🎯 Target Group 
          │ 
          ▼ 
     ⚖️ ALB 
          │ 
          ▼ 
       👤 Users 
``` 
 
--- 
 
# 🛠️ Technologies Used 
 
### 💻 Development 
 
* VS Code 
* Node.js 
* Express.js 
* HTML 
* CSS 
* JavaScript 
* MySQL 
 
### 🔧 DevOps 
 
* Git 
* GitHub 
* GitHub Actions 
* Docker 
* Docker Hub 
 
### ☁️ AWS Services 
 
* Amazon EC2 
* Amazon VPC 
* Security Groups 
* IAM 
* Amazon S3 
* Amazon RDS 
* Amazon EBS 
* EBS Snapshots 
* AMI 
* Launch Template 
* Target Group 
* Application Load Balancer 
* Auto Scaling Group 
 
--- 
 
# 🚀 Step-by-Step Implementation 
 
## 1️⃣ Local Development — VS Code 
 
The application was first developed and tested locally using VS Code. 
 
The project contains: 
 
```text 
cloud-student-portal/ 
│ 
├── backend/ 
│   ├── auth.js 
│   ├── db.js 
│   ├── seedAdmin.js 
│   └── server.js 
│ 
├── frontend/ 
│   ├── index.html 
│   ├── login.html 
│   ├── register.html 
│   ├── dashboard.html 
│   ├── admin.html 
│   ├── css/ 
│   └── js/ 
│ 
├── database/ 
│   └── schema.sql 
│ 
├── Dockerfile 
├── package.json 
├── .env.example 
└── .gitignore 
``` 
 
The application was tested locally before deployment. 
 
--- 
 
# 2️⃣ GitHub — Source Code 
 
After completing the application, the project was pushed from VS Code to GitHub. 
 
```text 
VS Code 
   ↓ 
git add 
   ↓ 
git commit 
   ↓ 
git push 
   ↓ 
GitHub 
``` 
 
Repository: 
 
**MdSamir8084/clouddocumentmanage** 
 
GitHub became the main source repository for the project. 
 
--- 
 
# 3️⃣ GitHub Actions — CI/CD 
 
GitHub Actions was configured to automate the Docker image build and push process. 
 
The workflow runs when code is pushed to the `main` branch. 
 
```text 
Git Push 
   ↓ 
GitHub Actions 
   ↓ 
Checkout Code 
   ↓ 
Docker Login 
   ↓ 
Docker Build 
   ↓ 
Docker Push 
   ↓ 
Docker Hub 
``` 
 
This removed the need to manually build and push the Docker image after every code update. 
 
--- 
 
# 4️⃣ Docker — Containerization 
 
A `Dockerfile` was created for the application. 
 
Docker packages the application and its required dependencies into an image. 
 
```text 
Node.js Application 
        + 
Dependencies 
        + 
Dockerfile 
        ↓ 
   Docker Image 
        ↓ 
   Docker Container 
``` 
 
This makes the application easier to run on EC2 and other environments. 
 
--- 
 
# 5️⃣ Docker Hub — Image Repository 
 
The Docker image generated by GitHub Actions was pushed to Docker Hub. 
 
```text 
mdsamir8084/clouddocumentmanage:latest 
``` 
 
The image can then be pulled by an EC2 server. 
 
```text 
Docker Hub 
    ↓ 
docker pull 
    ↓ 
EC2 
    ↓ 
Docker Container 
``` 
 
--- 
 
# 6️⃣ VPC — AWS Network 
 
The AWS infrastructure was deployed inside an Amazon VPC. 
 
The VPC provided the network environment for: 
 
* EC2 
* RDS 
* Load Balancer 
* Subnets 
* Route Tables 
* Internet Gateway 
* Security Groups 
 
Basic structure: 
 
```text 
VPC 
 │ 
 ├── Public Subnet 
 │      ├── EC2 
 │      └── ALB 
 │ 
 └── Private Network 
        └── RDS 
``` 
 
--- 
 
# 7️⃣ Security Groups — Network Access 
 
Security Groups were configured to control traffic between AWS resources. 
 
Examples: 
 
```text 
SSH      → 22 
HTTP     → 80 
App      → 3000 
MySQL    → 3306 
``` 
 
For RDS, MySQL access was configured from the application EC2 Security Group. 
 
```text 
EC2 Security Group 
        │ 
        │ TCP 3306 
        ▼ 
RDS Security Group 
``` 
 
This prevents unnecessary public access to the database. 
 
--- 
 
# 8️⃣ IAM — AWS Permissions 
 
An IAM Role was attached to EC2 for accessing AWS services such as S3. 
 
```text 
EC2 
 │ 
 ▼ 
IAM Role 
 │ 
 ▼ 
AWS Permissions 
 │ 
 ▼ 
S3 
``` 
 
The application does not need to store AWS access keys directly on the server. 
 
IAM was used to control **who can access which AWS resources**. 
 
--- 
 
# 9️⃣ EC2 — Application Deployment 
 
Amazon EC2 was used as the application server. 
 
The basic deployment process was: 
 
```text 
Launch EC2 
    ↓ 
Connect using SSH 
    ↓ 
Install required tools 
    ↓ 
Clone / Pull application 
    ↓ 
Configure environment 
    ↓ 
Run application 
    ↓ 
Test from browser 
``` 
 
Docker was later used to run the application container on EC2. 
 
--- 
 
# 🔟 Amazon S3 — Document Storage 
 
Amazon S3 was integrated with the application for storing uploaded documents. 
 
The application uses the AWS SDK to communicate with S3. 
 
```text 
👤 User 
   │ 
   ▼ 
🌐 Application 
   │ 
   ▼ 
AWS SDK 
   │ 
   ▼ 
IAM Role 
   │ 
   ▼ 
🪣 S3 Bucket 
   │ 
   ▼ 
📄 PDF / Image / Document 
``` 
 
S3 is responsible for storing the actual files. 
 
--- 
 
# 1️⃣1️⃣ Amazon RDS — MySQL Database 
 
Amazon RDS for MySQL was used to store application data. 
 
The application connects to RDS through the private AWS network. 
 
```text 
EC2 
 │ 
 │ TCP 3306 
 ▼ 
RDS MySQL 
 │ 
 ▼ 
Database 
``` 
 
The database stores information such as: 
 
* Users 
* Documents 
* Messages 
* User-related data 
 
--- 
 
# 1️⃣2️⃣ S3 + RDS Integration 
 
S3 and RDS have different responsibilities. 
 
```text 
              User uploads document 
                       │ 
                       ▼ 
                  Application 
                    /       \ 
                   /         \ 
                  ▼           ▼ 
                S3            RDS 
          Actual File      File Metadata 
``` 
 
### 🪣 S3 
 
Stores: 
 
* PDF 
* Image 
* Document 
* Other uploaded files 
 
### 🗄️ RDS 
 
Stores: 
 
* User information 
* File name 
* User ID 
* File type 
* File size 
* Upload information 
 
This keeps file storage separate from structured database data. 
 
--- 
 
# 1️⃣3️⃣ EBS — EC2 Storage 
 
Amazon EBS was used as block storage for EC2. 
 
```text 
EC2 
 │ 
 ▼ 
EBS Volume 
 │ 
 ▼ 
Filesystem 
 │ 
 ▼ 
Application / Server Data 
``` 
 
EBS was also practiced for attaching and mounting additional storage. 
 
--- 
 
# 1️⃣4️⃣ EBS Snapshot — Backup Practice 
 
EBS Snapshots were practiced for backup and recovery. 
 
```text 
EBS Volume 
     │ 
     ▼ 
 Snapshot 
     │ 
     ▼ 
 New EBS Volume 
     │ 
     ▼ 
 Another EC2 
``` 
 
This helped understand how EC2 storage can be backed up and reused. 
 
--- 
 
# 1️⃣5️⃣ AMI — EC2 Image 
 
A working EC2 instance was used to create an AMI. 
 
```text 
Working EC2 
     │ 
     ▼ 
 Create AMI 
     │ 
     ▼ 
Reusable Server Image 
     │ 
     ▼ 
New EC2 Instance 
``` 
 
AMI was later used as the base for launching additional application servers. 
 
--- 
 
# 1️⃣6️⃣ Launch Template 
 
A Launch Template was created to save the EC2 configuration. 
 
It can define: 
 
* AMI 
* Instance type 
* Key pair 
* Security Group 
* IAM Instance Profile 
* Storage 
* User Data 
 
```text 
Launch Template 
       │ 
       ▼ 
 EC2 Configuration 
       │ 
       ▼ 
 New EC2 Instances 
``` 
 
This makes launching multiple similar servers easier. 
 
--- 
 
# 1️⃣7️⃣ Target Group 
 
A Target Group was configured to manage the EC2 application servers behind the Load Balancer. 
 
Health check endpoint: 
 
```text 
/api/health 
``` 
 
Flow: 
 
```text 
ALB 
 │ 
 ▼ 
Target Group 
 │ 
 ├── EC2-1 ✅ 
 ├── EC2-2 ✅ 
 └── EC2-3 ❌ 
``` 
 
Only healthy targets should receive application traffic. 
 
--- 
 
# 1️⃣8️⃣ Application Load Balancer 
 
An Application Load Balancer was placed in front of the EC2 instances. 
 
```text 
Users 
  │ 
  ▼ 
ALB 
  │ 
  ▼ 
Target Group 
  │ 
  ├── EC2-1 
  ├── EC2-2 
  └── EC2-3 
``` 
 
The ALB provides a single entry point and distributes traffic across healthy application servers. 
 
--- 
 
# 1️⃣9️⃣ Auto Scaling Group 
 
Auto Scaling was configured using the Launch Template and Target Group. 
 
    text 
Launch Template 
       │ 
       ▼ 
Auto Scaling Group 
       │ 
       ├── EC2-1 
       ├── EC2-2 
       └── EC2-3 
              │ 
              ▼ 
        Target Group 
              │ 
              ▼ 
             ALB 
``` 
 
The Auto Scaling Group manages the required EC2 capacity. 
 
--- 
 
# 🔐 IAM + Security Group Difference 
 
One important concept learned during the project was the difference between IAM and Security Groups. 
 
### 🔐 IAM 
 
Controls: 
 
> **What AWS resources can this identity access?** 
 
Example: 
 
```text 
EC2 → IAM Role → S3 
``` 
 
### 🛡️ Security Group 
 
Controls: 
 
> **Which network traffic is allowed?** 
 
Example: 
 
```text 
EC2 → TCP 3306 → RDS 
``` 
 
Both are important, but they solve different problems. 
 
--- 
 
# 🔄 Final End-to-End Workflow 
 
```text 
                 👨‍💻 Developer 
                      │ 
                      ▼ 
                  🖥️ VS Code 
                      │ 
                  git push 
                      │ 
                      ▼ 
                  🐙 GitHub 
                      │ 
                      ▼ 
              ⚙️ GitHub Actions 
                      │ 
                Docker Build 
                      │ 
                      ▼ 
                🐳 Docker Hub 
                      │ 
                Docker Pull 
                      │ 
                      ▼ 
                 ☁️ AWS EC2 
                      │ 
                 Docker App 
                      │ 
          ┌───────────┴───────────┐ 
          │                       │ 
          ▼                       ▼ 
      🪣 S3                   🗄️ RDS 
   File Storage             MySQL Database 
          │                       │ 
          └───────────┬───────────┘ 
                      │ 
                      ▼ 
                🎯 Target Group 
                      │ 
                      ▼ 
                 ⚖️ ALB 
                      │ 
                      ▼ 
              🔄 Auto Scaling 
                      │ 
             ┌────────┴────────┐ 
             ▼                 ▼ 
           EC2-1             EC2-2 
             │                 │ 
             └────────┬────────┘ 
                      ▼ 
                    👤 User 
``` 
 
--- 
 
# 📊 AWS Services and Their Work 
 
| ☁️ Service          | 🔧 What I Used It For           | 
| ------------------- | ------------------------------- | 
| 🖥️ EC2             | Application server              | 
| 🌐 VPC              | AWS network                     | 
| 🔐 IAM              | AWS permissions                 | 
| 🛡️ Security Groups | Network traffic control         | 
| 🪣 S3               | Document/file storage           | 
| 🗄️ RDS             | MySQL database                  | 
| 💾 EBS              | EC2 block storage               | 
| 📸 EBS Snapshot     | Storage backup/recovery         | 
| 🖼️ AMI             | Reusable EC2 image              | 
| 📋 Launch Template  | Standard EC2 configuration      | 
| 🎯 Target Group     | EC2 registration + health check | 
| ⚖️ ALB              | Load balancing                  | 
| 🔄 Auto Scaling     | EC2 capacity management         | 
| 🐳 Docker           | Application containerization    | 
| 🐙 GitHub           | Source code management          | 
| ⚙️ GitHub Actions   | CI/CD automation                | 
| 🐳 Docker Hub       | Docker image repository         | 
 
--- 
 
# 🎯 What I Learned From This Project 
 
This project helped me understand how individual cloud services connect to form a complete application environment. 
 
The main workflow I practiced was: 
 
```text 
Code 
 ↓ 
GitHub 
 ↓ 
CI/CD 
 ↓ 
Docker 
 ↓ 
Docker Hub 
 ↓ 
EC2 
 ↓ 
IAM + Security Groups 
 ↓ 
S3 + RDS 
 ↓ 
ALB + Target Group 
 ↓ 
AMI + Launch Template 
 ↓ 
Auto Scaling 
``` 
 
Instead of learning each service only theoretically, I used the same application to connect different services and understand their role in a real deployment. 
 
--- 
 
# 📁 Project Structure 
 
```text 
cloud-student-portal/ 
│ 
├── backend/ 
├── frontend/ 
├── database/ 
├── screenshots/ 
├── architecture/ 
├── documentation/ 
│ 
├── Dockerfile 
├── .dockerignore 
├── .gitignore 
├── .env.example 
├── package.json 
└── README.md 
``` 
 
--- 
 
# 🔒 Security Note 
 
No passwords, AWS secret keys, Docker Hub tokens or other sensitive credentials should be stored in the GitHub repository. 
 
Environment variables are used for sensitive application configuration. 
 
```text 
.env 
``` 
 
is kept outside the public repository. 
 
--- 
 
# 👨‍💻 Project 
 
**Cloud Student Portal – AWS Cloud Deployment** 
 
**GitHub:** `MdSamir8084/clouddocumentmanage` 
 
**Main Technologies:** 
`Node.js` · `Express.js` · `MySQL` · `Docker` · `GitHub Actions` · `AWS` 
 
**AWS Services:** 
`EC2` · `VPC` · `IAM` · `S3` · `RDS` · `EBS` · `AMI` · `Launch Template` · `ALB` · `Target Group` · `Auto Scaling` · `Security Groups` 
 
--- 
 
## 🚀 Project Summary 
 
> **Developed a cloud-based student portal and deployed it on AWS using Docker and GitHub Actions. Integrated Amazon S3 for document storage and Amazon RDS for MySQL database management, and configured IAM, VPC, Security Groups, EBS, ALB, Target Group, AMI, Launch Template and Auto Scaling to build and test a complete cloud deployment workflow.** 
 

esko kis nem se dalun documentation folder me 