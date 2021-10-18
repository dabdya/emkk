# Generated by Django 3.2.8 on 2021-10-12 07:37

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='%Y/%m/%d/')),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('result', models.CharField(choices=[('route_completed', 'Route Completed'), ('on_route', 'On Route'), ('created', 'Created'), ('on_review', 'On Review'), ('at_issuer', 'At Issuer'), ('in_rework', 'On Rework'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='on_review', max_length=30)),
                ('result_comment', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('route_completed', 'Route Completed'), ('on_route', 'On Route'), ('created', 'Created'), ('on_review', 'On Review'), ('at_issuer', 'At Issuer'), ('in_rework', 'On Rework'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='created', max_length=30)),
                ('kind', models.CharField(choices=[('pedestrian', 'Pedestrian'), ('cycling', 'Cycling'), ('mountain', 'Mountain'), ('water', 'Water'), ('ski', 'Ski')], max_length=30)),
                ('group_name', models.CharField(max_length=100)),
                ('difficulty_category', models.IntegerField()),
                ('district', models.CharField(max_length=100)),
                ('participants_count', models.IntegerField()),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('coordinator_info', models.TextField()),
                ('insurance_info', models.TextField()),
                ('start_apply', models.TextField(null=True)),
                ('end_apply', models.TextField(null=True)),
            ],
        ),
    ]
