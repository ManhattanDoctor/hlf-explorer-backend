{{- define "hlf-explorer-envs" }}
- name: POSTGRES_DB_HOST
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.host | first | default .Values.postgres_gcp.host._default }}"

- name: POSTGRES_DB
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.db | first | default .Values.postgres_gcp.db._default }}"

- name: POSTGRES_USER
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.user | first | default .Values.postgres_gcp.user._default }}"

- name: POSTGRES_PASSWORD
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.password | first | default .Values.postgres_gcp.password._default }}"

- name: POSTGRES_DB_PORT
  value: "{{ pluck .Values.global.env .Values.postgres_gcp.port | first | default .Values.postgres_gcp.port._default }}"

- name: LOGGER_LEVEL
  value: "3"
- name: WEB_PORT
  value: "3000"

- name: FABRIC_IDENTITY
  value: "user"
- name: FABRIC_IDENTITY_MSP_ID
  value: "Org1MSP"
- name: FABRIC_IDENTITY_PRIVATE_KEY
  value: | 
    -----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgL7pUlT8u3egYc4rG\nCSiLnWYbj70xaiKwXHQ0v1SEN0OhRANCAAT41w4N/PHlu4uTiZiUVD+GM3finwCv\nsnc7TlMU7snJKWQudMYV5w3GpMiMYnoSR0V9lZxkFYigB8lv4fFSaA4J\n-----END PRIVATE KEY-----
- name: FABRIC_IDENTITY_CERTIFICATE
  value: |
    -----BEGIN CERTIFICATE-----\nMIICKTCCAdCgAwIBAgIQEy8FNd++X3camyIspVNIXTAKBggqhkjOPQQDAjBzMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\nb3JnMS5leGFtcGxlLmNvbTAeFw0yMDA5MDMxNDA4MDBaFw0zMDA5MDExNDA4MDBa\nMGwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\nYW4gRnJhbmNpc2NvMQ8wDQYDVQQLEwZjbGllbnQxHzAdBgNVBAMMFlVzZXIxQG9y\nZzEuZXhhbXBsZS5jb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAT41w4N/PHl\n u4uTiZiUVD+GM3finwCvsnc7TlMU7snJKWQudMYV5w3GpMiMYnoSR0V9lZxkFYig\n B8lv4fFSaA4Jo00wSzAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADArBgNV\n HSMEJDAigCBYbd3XQG2WRlATguic0ppLez6aexkdkqvbqWLmT1tYFTAKBggqhkjO\n PQQDAgNHADBEAiBiYpcZWqXzfP4BWnwczlmQP8XQvQqDiL/I/lCAKxS+pAIgfwT4\nZtA+M4s3LLam0UVX7vf81CWXK9upFICLEkH2o5A=\n-----END CERTIFICATE-----
- name: FABRIC_IS_DISCOVERY_ENABLED
  value: "false"
- name: FABRIC_CHAINCODE_NAME
  value: "main"
- name: FABRIC_NETWORK_NAME
  value: "mychannel"
- name: FABRIC_CONNECTION_SETTINGS_PATH
  value: "src/connection.json"
{{- end }}
