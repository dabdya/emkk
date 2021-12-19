from django.test import TestCase
from django.core.files.base import ContentFile, File

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.models import Document, Trip
from src.jwt_auth.models import User

import uuid


class DocumentTest(TestCase):

    def setUp(self):
        self.env = TestEnvironment().with_user()

    def test_only_owner_can_delete_document(self):
        document = Document(owner=self.env.user, uuid=uuid.uuid4(),
                            filename="test_file", content_type="text/plain")
        document.file.save("test_file", ContentFile('Test file content'))
        document.save()

        """Reviewer can get document uuid when check trip"""
        reviewer = self.env.eg.generate_instance_by_model(User, REVIEWER=True, is_active=True)
        reviewer.save()

        r = self.env.client_delete(f'/api/documents/{document.uuid}', user=reviewer)
        self.assertEqual(r.status_code, 403)

        r = self.env.client_delete(f'/api/documents/{document.uuid}')
        self.assertEqual(r.status_code, 204)

    def test_only_object_owner_can_create_or_get_documents_for_this_object(self):

        trip = self.env.eg.generate_instance_by_model(Trip, leader=self.env.user)
        trip.save()

        document = Document(owner=self.env.user, uuid=uuid.uuid4(),
                            filename="trip_document", content_type="text/plain")
        document.file.save("trip_document", ContentFile('Test file content'))
        document.save()

        r = self.env.client_get(f'/api/trips/{trip.id}/documents')
        self.assertEqual(r.status_code, 200)

        other_user = self.env.eg.generate_instance_by_model(
            User, REVIEWER=False, ISSUER=False, SECRETARY=False, is_active=True)
        other_user.save()
        r = self.env.client_get(f'/api/trips/{trip.id}/documents', user=other_user)
        self.assertEqual(r.status_code, 403)
