hydrooj cli system set file.endPoint http://oj-minio:9000/
hydrooj cli system set file.accessKey "minioadmin"
hydrooj cli system set file.secretKey "minioadmin"
hydrooj cli system set elastic.host oj-elastic

hydrooj cli user create systemadmin@systemjudge.local root rootroot 2
hydrooj cli user setSuperAdmin 2
hydrooj cli user create systemjudge@systemjudge.local judger judgerjudger 3
hydrooj cli user setJudge 3
