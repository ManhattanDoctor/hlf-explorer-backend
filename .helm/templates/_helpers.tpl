{{- define "karma.assignPodsToNodes" -}}
      {{- with .Values.nodeSelector }}
      nodeSelector:
{{ toYaml . | indent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
{{ toYaml . | indent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
{{ toYaml . | indent 8 }}
      {{- end }}
{{- end -}}
