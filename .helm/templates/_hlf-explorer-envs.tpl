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

- name: FABRIC_IDENTITY
  value: "user1"
- name: FABRIC_IDENTITY_MSP_ID
  value: "Org1MSP"
- name: FABRIC_IDENTITY_PRIVATE_KEY
  value: | 
    "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgFV2tecLU03cs8uQG\nOTqAvoGZT/WNvY2sFsvGLAlLX9ahRANCAATRwhiQNQGvRszE5vjN1ZUU0Qor5aVV\nmpff+rFd8szAH9VIw+VXDExI1D2u1OPR3Jci2VfE8jq/IPg65QuKh/wE\n-----END PRIVATE KEY-----"
- name: FABRIC_IDENTITY_CERTIFICATE
  value: |
    "-----BEGIN CERTIFICATE-----\nMIICjjCCAjWgAwIBAgIUOiQB5yeOWfYmGPVO8VZUA0ouxLMwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzI0MTYwNzAwWhcNMjEwMzI0MTYx\nMjAwWjBCMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw\nYXJ0bWVudDExDjAMBgNVBAMTBXVzZXIxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAE0cIYkDUBr0bMxOb4zdWVFNEKK+WlVZqX3/qxXfLMwB/VSMPlVwxMSNQ9rtTj\n0dyXItlXxPI6vyD4OuULiof8BKOB1zCB1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUC+JeBv82tQd2FXIdZvx9mg57wCgwKwYDVR0jBCQw\nIoAgUn+0FOv3dX+1WR7Fa8jfriCeHzZbH7Jat8R1I2RDTQ8waAYIKgMEBQYHCAEE\nXHsiYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1lbnQxIiwi\naGYuRW5yb2xsbWVudElEIjoidXNlcjEiLCJoZi5UeXBlIjoiY2xpZW50In19MAoG\nCCqGSM49BAMCA0cAMEQCIGZJMg1Z7/MdTjqACo8JDaIJ8XBpujZ6K+BTiMDXV6Sp\nAiAAmPhEIica+eb8v+fvDvX6s70o29qOYrXa9ftiI+J5NQ==\n-----END CERTIFICATE-----\n"
- name: FABRIC_IS_DISCOVERY_ENABLED
  value: false
- name: FABRIC_CHAINCODE_NAME
  value: "main"
- name: FABRIC_NETWORK_NAME
  value: "mychannel"
- name: FABRIC_CONNECTION_SETTINGS_PATH
  value: "src/connection.json"
{{- end }}
