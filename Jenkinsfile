pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'production'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('📥 Checkout SCM') {
            steps {
                echo 'Đang tải mã nguồn từ Git repository...'
                checkout scm
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                echo 'Đang cài đặt các thư viện phụ thuộc bằng npm ci...'
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('🔍 Code Quality & Lint') {
            steps {
                echo 'Đang kiểm tra chất lượng mã nguồn (Linter)...'
                script {
                    if (isUnix()) {
                        sh 'npm run lint'
                    } else {
                        bat 'npm run lint'
                    }
                }
            }
        }

        stage('🧪 Run Unit Tests') {
            steps {
                echo 'Đang chạy kiểm thử tự động (Unit Tests) trước khi deploy...'
                script {
                    if (isUnix()) {
                        sh 'npm test'
                    } else {
                        bat 'npm test'
                    }
                }
            }
        }

        stage('🏗️ Type Check & Build') {
            steps {
                echo 'Đang biên dịch TypeScript và đóng gói Vite production bundle...'
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('📦 Archive Artifacts') {
            steps {
                echo 'Lưu trữ thư mục kết quả biên dịch dist/...'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: false
            }
        }

        stage('🚀 Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo '=========================================================='
                echo 'Tất cả các bài test và biên dịch đã vượt qua thành công!'
                echo 'Bắt đầu bước triển khai (Deploy) tới máy chủ...'
                echo '=========================================================='
                script {
                    if (isUnix()) {
                        sh 'echo "Deploying dist to Web Server (Nginx/Hosting)..."'
                    } else {
                        bat 'echo "Deploying dist to Web Server (Nginx/Hosting)..."'
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Quy trình pipeline hoàn tất.'
        }
        success {
            echo '🎉 BUILD THÀNH CÔNG: Mọi bài test đã passed, sẵn sàng vận hành!'
        }
        failure {
            echo '❌ BUILD THẤT BẠI: Có lỗi ở bước test hoặc biên dịch, đã hủy deploy an toàn!'
        }
    }
}
